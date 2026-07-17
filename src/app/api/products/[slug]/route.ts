import { NextRequest, NextResponse } from 'next/server';
import { fetchProductBySlug } from '@/services/products/productService';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Product slug is required' },
        { status: 400 },
      );
    }

    const product = await fetchProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error('[ProductBySlugAPI] Error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: 'Failed to load product' },
      { status: 500 },
    );
  }
}
