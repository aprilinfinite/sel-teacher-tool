import { NextRequest, NextResponse } from 'next/server';
import { saveBundle, listAllBundles } from '@/services/bundles/bundleService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bundles = await listAllBundles();
    return NextResponse.json(bundles);
  } catch (err) {
    console.error('[AdminBundlesAPI] GET:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to load bundles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bundleId, resourceId, title, price, purchaseUrl, status, productIds, thumbnailPath } = body;

    if (!resourceId) {
      return NextResponse.json({ error: 'resourceId is required' }, { status: 400 });
    }

    const bundle = await saveBundle(
      Number(resourceId),
      {
        title: title || '',
        price: price || '',
        purchaseUrl: purchaseUrl || '',
        status: status || 'Draft',
        productIds: Array.isArray(productIds) ? productIds : undefined,
      },
      bundleId || null,
      null,
      thumbnailPath ?? undefined,
    );

    return NextResponse.json({ success: true, bundle });
  } catch (err) {
    console.error('[AdminBundlesAPI] POST:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to save bundle' }, { status: 500 });
  }
}
