import { NextRequest, NextResponse } from 'next/server';
import { getBundleByResourceId, updateBundle, deleteBundle } from '@/services/bundles/bundleRepository';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const bundle = await getBundleByResourceId(Number(id));
    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
    }
    return NextResponse.json(bundle);
  } catch (err) {
    console.error('[AdminBundleAPI] GET:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to load bundle' }, { status: 500 });
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
      await updateBundle(id, { status });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'status field is required' }, { status: 400 });
  } catch (err) {
    console.error('[AdminBundleAPI] PATCH:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to update bundle' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteBundle(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[AdminBundleAPI] DELETE:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to delete bundle' }, { status: 500 });
  }
}
