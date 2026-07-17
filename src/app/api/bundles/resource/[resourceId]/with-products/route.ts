import { NextRequest, NextResponse } from 'next/server';
import { getBundle } from '@/services/bundles/bundleService';
import { fetchPublishedProductsByResource } from '@/services/products/productService';
import { calculateBundlePricing } from '@/services/bundles/bundlePricing';
import { getBundleProductIds } from '@/services/bundles/bundleRepository';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> },
) {
  try {
    const { resourceId } = await params;
    const id = parseInt(resourceId, 10);

    if (isNaN(id) || id < 1) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 },
      );
    }

    // Get the bundle for this resource
    const bundle = await getBundle(id);

    if (!bundle) {
      return NextResponse.json(null);
    }

    // Only return published bundles
    if (bundle.status !== 'Published') {
      return NextResponse.json(null);
    }

    // Get the product IDs linked to this bundle
    const productIds = bundle.productIds || [];

    if (productIds.length === 0) {
      return NextResponse.json({
        ...bundle,
        includedProducts: [],
        pricing: null,
      });
    }

    // Fetch all published products for this resource
    const allProducts = await fetchPublishedProductsByResource(id);

    // Filter to only the products that are in this bundle
    const includedProducts = allProducts.filter((p) => productIds.includes(p.id));

    // Calculate pricing
    const pricing = calculateBundlePricing(
      includedProducts.map((p) => ({
        title: p.title,
        sortOrder: p.sortOrder,
        price: p.price,
        purchaseUrl: p.purchaseUrl,
      })),
      bundle.price,
    );

    return NextResponse.json({
      ...bundle,
      includedProducts,
      pricing,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[BundleWithProductsAPI] GET Error:', message);
    return NextResponse.json(
      { error: `Failed to load bundle with products: ${message}` },
      { status: 500 },
    );
  }
}
