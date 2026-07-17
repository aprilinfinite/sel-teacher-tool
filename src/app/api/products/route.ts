import { NextResponse } from 'next/server';
import { fetchAllProducts } from '@/services/products/productService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await fetchAllProducts();
    return NextResponse.json(products);
  } catch (err) {
    console.error('[ProductsAPI] Error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: 'Failed to load products' },
      { status: 500 },
    );
  }
}
