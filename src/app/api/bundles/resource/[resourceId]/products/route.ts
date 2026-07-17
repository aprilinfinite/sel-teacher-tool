import { NextRequest, NextResponse } from 'next/server';
import { fetchProductsByResource } from '@/services/products/productService';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> },
) {
  try {
    const { resourceId } = await params;
    const products = await fetchProductsByResource(Number(resourceId));
    return NextResponse.json(products);
  } catch (err) {
    console.error('[BundleProductsAPI] GET:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to load bundle products' }, { status: 500 });
  }
}
