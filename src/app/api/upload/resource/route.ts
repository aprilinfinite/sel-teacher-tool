import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import slugify from 'slugify';

export const maxDuration = 60;

function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true });
}

export async function POST(req: NextRequest) {
  // TEMPORARY: disable auth while building admin
  // const authHeader = req.headers.get('Authorization');
  // const token = authHeader?.replace('Bearer ', '');

  // if (!token || !verifyAdminToken(token)) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const formData = await req.formData();

    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const status = (formData.get('status') as string) || 'draft';
    const featured = formData.get('featured') === 'true';
    const displayOrderStr = formData.get('display_order') as string;
    const display_order = displayOrderStr ? parseInt(displayOrderStr, 10) : 0;

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    // Descriptions
    const short_description = (formData.get('short_description') as string) || null;
    const resource_description = (formData.get('resource_description') as string) || null;

    // Classification
    const tags = (formData.get('tags') as string) || null;
    const gradeLevel = JSON.parse((formData.get('gradeLevel') as string) || '[]');
    const grade_level = Array.isArray(gradeLevel) ? gradeLevel.join(', ') : null;
    const time_needed = (formData.get('time_needed') as string) || null;
    const materials_needed = (formData.get('materials_needed') as string) || null;
    const resource_type = (formData.get('resource_type') as string) || null;

    // Track created_by
    const adminEmail = formData.get('admin_email') as string;

    const baseSlug = generateSlug(title);

    // Make slug unique against Supabase resources table
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from('resources')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${baseSlug}-${counter++}`;
    }

    let file_path: string | null = null;
    let thumbnail_path: string | null = null;
    let pdfFileName: string | null = null;
    let thumbFileName: string | null = null;

    // Handle PDF — upload to Supabase Storage bucket: resource-files
    const file = formData.get('pdf') as File | null;
    if (file && file.size > 0) {
      const ext = file.name.split('.').pop() || 'pdf';
      pdfFileName = `${slug}.${ext}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('resource-files')
        .upload(pdfFileName, file, { contentType: file.type, upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabaseAdmin.storage
        .from('resource-files')
        .getPublicUrl(pdfFileName);
      file_path = urlData.publicUrl;
    }

    // Handle thumbnail — upload to Supabase Storage bucket: resource-thumbnails
    const thumbnail = formData.get('thumbnail') as File | null;
    if (thumbnail && thumbnail.size > 0) {
      const ext = thumbnail.name.split('.').pop() || 'jpg';
      thumbFileName = `${slug}-thumb.${ext}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('resource-thumbnails')
        .upload(thumbFileName, thumbnail, { contentType: thumbnail.type, upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabaseAdmin.storage
        .from('resource-thumbnails')
        .getPublicUrl(thumbFileName);
      thumbnail_path = urlData.publicUrl;
    }

    // Insert resource into Supabase
    // NOTE: Only include columns that exist in the database schema.
    const insertPayload: Record<string, unknown> = {
      title,
      slug,
      category,
      status,
      featured: featured ? 1 : 0,
      grade_level,
      time_needed,
      file_path,
      thumbnail_path,
      download_count: 0,
    };


    const { data, error: insertError } = await supabaseAdmin
      .from('resources')
      .insert(insertPayload)
      .select('id')
      .single();

    if (insertError) {
      // Clean up uploaded files if database insert fails
      if (file_path && pdfFileName) {
        await supabaseAdmin.storage.from('resource-files').remove([pdfFileName]);
      }
      if (thumbnail_path && thumbFileName) {
        await supabaseAdmin.storage.from('resource-thumbnails').remove([thumbFileName]);
      }
      throw insertError;
    }

    return NextResponse.json({ success: true, id: data.id, slug });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'object'
          ? JSON.stringify(err, null, 2)
          : String(err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
