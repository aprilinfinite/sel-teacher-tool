import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('thumbnail') as File | null;
    const bundleId = formData.get('bundleId') as string | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No thumbnail file provided' }, { status: 400 });
    }

    if (!bundleId) {
      return NextResponse.json({ error: 'bundleId is required' }, { status: 400 });
    }

    // Generate a unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `bundle-${bundleId}-thumb.${ext}`;

    // Upload to Supabase Storage bucket: resource-thumbnails (reuse existing bucket)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('resource-thumbnails')
      .upload(fileName, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload thumbnail' }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('resource-thumbnails')
      .getPublicUrl(fileName);

    const thumbnailPath = urlData.publicUrl;

    return NextResponse.json({ success: true, thumbnailPath });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to upload thumbnail' },
      { status: 500 },
    );
  }
}
