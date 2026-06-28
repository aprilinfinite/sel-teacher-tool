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
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const gradeLevel = JSON.parse(
      (formData.get('gradeLevel') as string) || '[]'
    );
    const grade_level =
      Array.isArray(gradeLevel)
        ? gradeLevel.join(', ')
        : null;
    const topic_tag = formData.get('topicTag') as string;
    const time_needed = formData.get('timeNeeded') as string;
    const seo_title = formData.get('seoTitle') as string;
    const seo_description = formData.get('seoDescription') as string;
    const focus_keyword = formData.get('focusKeyword') as string;
    const thumbnail_alt = null;
    const featured = formData.get('featured') === 'true';
    const sel_skill = formData.get('selSkill') as string;
    const learner_need = formData.get('learnerNeed') as string;
    const situation = formData.get('situation') as string;
    const resource_format = formData.get('resourceFormat') as string;

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

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
    const { data, error: insertError } = await supabaseAdmin
      .from('resources')
      .insert({
        title,
        slug,
        description: description || null,
        category,
        grade_level,
        topic_tag: topic_tag || null,
        time_needed: time_needed || null,
        file_path,
        thumbnail_path,
        thumbnail_alt,
        seo_title: seo_title || null,
        seo_description: seo_description || null,
        focus_keyword: focus_keyword || null,
        featured: featured ? 1 : 0,
        download_count: 0,
        sel_skill: sel_skill || null,
        learner_need: learner_need || null,
        situation: situation || null,
        resource_format: resource_format || null,
      })
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