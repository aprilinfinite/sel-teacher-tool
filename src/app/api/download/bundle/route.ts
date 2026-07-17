import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getPurchaseBySessionId } from '@/services/purchases/purchaseRepository';
import { getBundleById, getBundleProductIds } from '@/services/bundles/bundleRepository';
import { getProductById } from '@/services/products/productRepository';

export const dynamic = 'force-dynamic';

const LOG_PREFIX = '[DownloadBundleAPI]';

/**
 * Extract the storage path within a bucket from a Supabase public URL.
 */
function extractStoragePath(publicUrl: string, bucket: string): string | null {
  const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/`;
  if (publicUrl.startsWith(storageUrl)) {
    return publicUrl.replace(storageUrl, '');
  }
  const match = publicUrl.match(new RegExp(`/storage/v1/object/public/${bucket}/(.+)`));
  return match ? match[1] : null;
}

/**
 * Generate a signed URL for a product file.
 */
async function generateSignedUrl(productId: number): Promise<{
  title: string;
  downloadUrl: string;
} | null> {
  const product = await getProductById(productId);
  if (!product || !product.file_path) return null;

  const storagePath = extractStoragePath(product.file_path, 'product-files');
  if (!storagePath) return null;

  const { data, error } = await supabaseAdmin.storage
    .from('product-files')
    .createSignedUrl(storagePath, 300); // 5 minutes

  if (error || !data) {
    console.error(`${LOG_PREFIX} Failed to generate signed URL for product ${productId}:`, error?.message);
    return null;
  }

  return {
    title: product.title,
    downloadUrl: data.signedUrl,
  };
}

/**
 * GET /api/download/bundle?session_id=cs_xxx
 *
 * Verifies a bundle purchase and generates temporary signed URLs
 * for each product file in the bundle.
 *
 * Security:
 * - Purchase must exist and be paid
 * - Purchase must reference a bundle
 * - Each product in the bundle must have a file
 * - Returns an array of { title, downloadUrl }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 },
      );
    }

    // 1. Lookup purchase
    const purchase = await getPurchaseBySessionId(sessionId);
    if (!purchase) {
      console.log(`${LOG_PREFIX} Purchase not found for session: ${sessionId}`);
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 },
      );
    }

    // 2. Verify payment status
    if (purchase.payment_status !== 'paid') {
      console.log(`${LOG_PREFIX} Payment not completed for session: ${sessionId}`);
      return NextResponse.json(
        { error: 'Payment has not been completed' },
        { status: 403 },
      );
    }

    // 3. Verify this is a bundle purchase
    if (!purchase.bundle_id) {
      console.log(`${LOG_PREFIX} Purchase is not a bundle purchase: ${sessionId}`);
      return NextResponse.json(
        { error: 'Purchase is not associated with a bundle' },
        { status: 400 },
      );
    }

    // 4. Locate the bundle
    const bundle = await getBundleById(purchase.bundle_id);
    if (!bundle) {
      console.log(`${LOG_PREFIX} Bundle not found for id: ${purchase.bundle_id}`);
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 },
      );
    }

    // 5. Get included product IDs
    const productIds = await getBundleProductIds(purchase.bundle_id);
    if (productIds.length === 0) {
      console.log(`${LOG_PREFIX} Bundle has no products: ${purchase.bundle_id}`);
      return NextResponse.json(
        { error: 'Bundle has no included products' },
        { status: 404 },
      );
    }

    // 6. Generate signed URLs for each product
    const signedUrls = await Promise.all(
      productIds.map((productId) => generateSignedUrl(productId)),
    );

    // Filter out any that failed
    const downloads = signedUrls.filter((url): url is { title: string; downloadUrl: string } => url !== null);

    if (downloads.length === 0) {
      console.log(`${LOG_PREFIX} No downloadable files found for bundle: ${purchase.bundle_id}`);
      return NextResponse.json(
        { error: 'No downloadable files available for this bundle' },
        { status: 404 },
      );
    }

    // 7. Update download tracking
    const { error: updateError } = await supabaseAdmin
      .from('purchases')
      .update({
        download_count: (purchase.download_count ?? 0) + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq('id', purchase.id);

    if (updateError) {
      console.error(`${LOG_PREFIX} Failed to update download count:`, updateError.message);
      // Non-fatal
    }

    console.log(`${LOG_PREFIX} Bundle download started:`, {
      sessionId,
      bundleId: bundle.id,
      title: bundle.title,
      fileCount: downloads.length,
      downloadCount: (purchase.download_count ?? 0) + 1,
    });

    // 8. Return the signed URLs
    return NextResponse.json({
      bundleTitle: bundle.title,
      downloads,
      expiresIn: 300,
    });
  } catch (err) {
    console.error(`${LOG_PREFIX} Error:`, err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 },
    );
  }
}
