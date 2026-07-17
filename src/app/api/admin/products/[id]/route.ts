import { NextRequest, NextResponse } from 'next/server';
import { fetchProduct, editProduct, deleteProduct, updateProductStatus } from '@/services/products/productService';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await fetchProduct(Number(id));

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error('[AdminProductAPI GET]', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await req.formData();

    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const purchaseUrl = formData.get('purchase_url') as string;
    const status = formData.get('status') as string;
    const sortOrder = formData.get('sort_order') as string;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const payload: Record<string, unknown> = {
      title,
      slug: slug || undefined,
      description: description || null,
      purchase_url: purchaseUrl || null,
      status: status || 'draft',
      sort_order: sortOrder ? parseInt(sortOrder, 10) : 0,
    };

    // Only include price if explicitly provided (preserve existing value otherwise)
    if (price !== undefined && price !== null && price !== '') {
      payload.price = parseFloat(price);
    } else if (price === '' || price === null) {
      // Explicitly set to null only when the field is submitted as empty
      payload.price = null;
    }


    // Handle remove_file and remove_thumbnail flags
    if (formData.get('remove_file') === 'true') {
      payload.remove_file = 'true';
    }
    if (formData.get('remove_thumbnail') === 'true') {
      payload.remove_thumbnail = 'true';
    }

    const pdfFile = formData.get('pdf') as File | null;
    const thumbnailFile = formData.get('thumbnail') as File | null;

    await editProduct(Number(id), payload, pdfFile, thumbnailFile);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[AdminProductAPI PUT]', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteProduct(Number(id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[AdminProductAPI DELETE]', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (status && typeof status === 'string') {
      await updateProductStatus(Number(id), status);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'status field is required' }, { status: 400 });
  } catch (err) {
    console.error('[AdminProductAPI PATCH]', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
