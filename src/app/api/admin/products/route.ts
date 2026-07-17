import { NextRequest, NextResponse } from 'next/server';
import { createProduct, duplicateProduct } from '@/services/products/productService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle JSON-based duplicate action
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { action, resourceId } = body;

      if (action === 'duplicate' && resourceId) {
        const product = await duplicateProduct(Number(resourceId));
        return NextResponse.json(product, { status: 201 });
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Handle form-data based product creation
    const formData = await req.formData();

    const resourceId = parseInt(formData.get('resource_id') as string, 10);
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const purchaseUrl = formData.get('purchase_url') as string;
    const status = formData.get('status') as string;
    const sortOrder = formData.get('sort_order') as string;

    if (!title || !resourceId) {
      return NextResponse.json(
        { error: 'Title and resource_id are required' },
        { status: 400 },
      );
    }

    const pdfFile = formData.get('pdf') as File | null;
    const thumbnailFile = formData.get('thumbnail') as File | null;

    const payload: Record<string, unknown> = {
      resource_id: resourceId,
      title,
      slug: slug || undefined,
      description: description || null,
      purchase_url: purchaseUrl || null,
      stripe_price_id: null,
      status: status || 'draft',
      sort_order: sortOrder ? parseInt(sortOrder, 10) : 0,
    };

    // Only include price if explicitly provided
    if (price !== undefined && price !== null && price !== '') {
      payload.price = parseFloat(price);
    } else if (price === '' || price === null) {
      payload.price = null;
    }


    const product = await createProduct(payload, pdfFile, thumbnailFile);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error('[AdminProductsAPI POST] Error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create product' },
      { status: 500 },
    );
  }
}
