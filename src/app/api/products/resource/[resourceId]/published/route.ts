import { NextRequest, NextResponse } from 'next/server';
import { fetchPublishedProductsByResource } from '@/services/products/productService';

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

    const products = await fetchPublishedProductsByResource(id);
    return NextResponse.json(products);
  } catch (err) {
    console.error('[PublishedProductsByResourceAPI] Error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: 'Failed to load published products for resource' },
      { status: 500 },
    );
  }
}
