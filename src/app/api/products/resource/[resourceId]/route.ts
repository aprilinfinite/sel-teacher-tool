import { NextRequest, NextResponse } from 'next/server';
import { fetchProductsByResource } from '@/services/products/productService';

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

    const products = await fetchProductsByResource(id);
    return NextResponse.json(products);
  } catch (err) {
    console.error('[ProductsByResourceAPI] Error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: 'Failed to load products for resource' },
      { status: 500 },
    );
  }
}
