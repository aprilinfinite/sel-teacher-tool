import { NextRequest, NextResponse } from 'next/server';
import { getBundle } from '@/services/bundles/bundleService';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> },
) {
  try {
    const { resourceId } = await params;
    const bundle = await getBundle(Number(resourceId));
    return NextResponse.json(bundle);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : '';
    console.error('[BundleAPI] GET Error:', message);
    console.error('[BundleAPI] GET Stack:', stack);
    return NextResponse.json({ error: `Failed to load bundle: ${message}` }, { status: 500 });
  }
}
