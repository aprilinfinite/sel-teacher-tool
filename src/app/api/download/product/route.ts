import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getPurchaseBySessionId } from '@/services/purchases/purchaseRepository';
import { getProductById } from '@/services/products/productRepository';

export const dynamic = 'force-dynamic';

const LOG_PREFIX = '[DownloadProductAPI]';

/**
 * GET /api/download/product?session_id=cs_xxx
 *
 * Verifies a purchase and generates a temporary signed URL for the product file.
 *
 * Security:
 * - Purchase must exist and be paid
 * - Purchase must reference a product (not a bundle)
 * - Product must have a file stored in Supabase Storage
 * - Returns a 5-minute signed URL
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

    // 3. Verify this is a product purchase
    if (!purchase.product_id) {
      console.log(`${LOG_PREFIX} Purchase is not a product purchase: ${sessionId}`);
      return NextResponse.json(
        { error: 'Purchase is not associated with a product' },
        { status: 400 },
      );
    }

    // 4. Locate the product
    const product = await getProductById(purchase.product_id);
    if (!product) {
      console.log(`${LOG_PREFIX} Product not found for id: ${purchase.product_id}`);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      );
    }

    // 5. Verify file exists
    if (!product.file_path) {
      console.log(`${LOG_PREFIX} Product has no file: ${product.id}`);
      return NextResponse.json(
        { error: 'Product file not available' },
        { status: 404 },
      );
    }

    // 6. Extract the storage path from the public URL
    // The file_path is stored as a public URL like:
    // https://<project>.supabase.co/storage/v1/object/public/product-files/<path>
    // We need to extract the path within the bucket
    const storageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-files/`;
    let storagePath: string;

    if (product.file_path.startsWith(storageUrl)) {
      storagePath = product.file_path.replace(storageUrl, '');
    } else {
      // Fallback: try to extract from any Supabase storage URL pattern
      const match = product.file_path.match(/\/storage\/v1\/object\/public\/product-files\/(.+)/);
      if (match) {
        storagePath = match[1];
      } else {
        // If it's not a Supabase URL, we can't generate a signed URL
        console.log(`${LOG_PREFIX} File path is not in Supabase storage: ${product.file_path}`);
        return NextResponse.json(
          { error: 'File storage location not recognized' },
          { status: 500 },
        );
      }
    }

    // 7. Generate a signed URL (5-minute expiry)
    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from('product-files')
      .createSignedUrl(storagePath, 300); // 5 minutes

    if (signedError || !signedData) {
      console.error(`${LOG_PREFIX} Failed to generate signed URL:`, signedError?.message);
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 },
      );
    }

    // 8. Update download tracking
    const { error: updateError } = await supabaseAdmin
      .from('purchases')
      .update({
        download_count: (purchase.download_count ?? 0) + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq('id', purchase.id);

    if (updateError) {
      console.error(`${LOG_PREFIX} Failed to update download count:`, updateError.message);
      // Non-fatal: continue even if tracking update fails
    }

    console.log(`${LOG_PREFIX} Download started:`, {
      sessionId,
      productId: product.id,
      title: product.title,
      downloadCount: (purchase.download_count ?? 0) + 1,
    });

    // 9. Return the signed URL
    return NextResponse.json({
      downloadUrl: signedData.signedUrl,
      title: product.title,
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
