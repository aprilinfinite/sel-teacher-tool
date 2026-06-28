import { NextRequest, NextResponse } from 'next/server';
import { getResource, editResource, deleteResource, updateResourceStatus, updateResourceFeatured } from '@/services/resources/resourceService';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const resource = await getResource(Number(id));
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    return NextResponse.json(resource);
  } catch (err) {
    console.error('[ResourceAPI GET]', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to load resource' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const gradeLevel = JSON.parse((formData.get('gradeLevel') as string) || '[]');
    const grade_level = Array.isArray(gradeLevel) ? gradeLevel.join(', ') : null;

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    const payload: Record<string, unknown> = {
      title,
      description: description || null,
      category,
      grade_level: grade_level || null,
      topic_tag: (formData.get('topicTag') as string) || null,
      time_needed: (formData.get('timeNeeded') as string) || null,
      seo_title: (formData.get('seoTitle') as string) || null,
      seo_description: (formData.get('seoDescription') as string) || null,
      focus_keyword: (formData.get('focusKeyword') as string) || null,
      featured: formData.get('featured') === 'true' ? 1 : 0,
      sel_skill: (formData.get('selSkill') as string) || null,
      learner_need: (formData.get('learnerNeed') as string) || null,
      situation: (formData.get('situation') as string) || null,
      resource_format: (formData.get('resourceFormat') as string) || null,
    };

    // Handle file replacement — only update if new files provided
    const pdf = formData.get('pdf') as File | null;
    if (pdf && pdf.size > 0) {
      const ext = pdf.name.split('.').pop() || 'pdf';
      const fileName = `resource-${id}.${ext}`;
      await supabaseAdmin.storage.from('resource-files').upload(fileName, pdf, { contentType: pdf.type, upsert: true });
      const { data: urlData } = supabaseAdmin.storage.from('resource-files').getPublicUrl(fileName);
      payload.file_path = urlData.publicUrl;
    }

    const thumbnail = formData.get('thumbnail') as File | null;
    if (thumbnail && thumbnail.size > 0) {
      const ext = thumbnail.name.split('.').pop() || 'jpg';
      const fileName = `resource-${id}-thumb.${ext}`;
      await supabaseAdmin.storage.from('resource-thumbnails').upload(fileName, thumbnail, { contentType: thumbnail.type, upsert: true });
      const { data: urlData } = supabaseAdmin.storage.from('resource-thumbnails').getPublicUrl(fileName);
      payload.thumbnail_path = urlData.publicUrl;
    }

    await editResource(Number(id), payload);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ResourceAPI PUT]', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteResource(Number(id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ResourceAPI DELETE]', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, featured } = body;

    // Handle status update
    if (status && typeof status === 'string') {
      await updateResourceStatus(Number(id), status);
      return NextResponse.json({ success: true });
    }

    // Handle featured update
    if (typeof featured === 'boolean') {
      await updateResourceFeatured(Number(id), featured);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'status or featured field is required' }, { status: 400 });
  } catch (err) {
    console.error('[ResourceAPI PATCH]', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}
