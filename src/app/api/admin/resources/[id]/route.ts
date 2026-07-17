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
    const slug = formData.get('slug') as string;
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

    // NOTE: Only include columns that exist in the database schema.
    const payload: Record<string, unknown> = {
      title,
      category,
      status,
      featured: featured ? 1 : 0,
      grade_level,
      time_needed,
    };

    // Allow manual slug editing
    if (slug && slug.trim()) {
      payload.slug = slug.trim();
    }


    // Handle thumbnail upload
    const thumbnail = formData.get('thumbnail') as File | null;
    if (thumbnail && thumbnail.size > 0) {
      const ext = thumbnail.name.split('.').pop() || 'jpg';
      const fileName = `resource-${id}-thumb.${ext}`;
      await supabaseAdmin.storage.from('resource-thumbnails').upload(fileName, thumbnail, { contentType: thumbnail.type, upsert: true });
      const { data: urlData } = supabaseAdmin.storage.from('resource-thumbnails').getPublicUrl(fileName);
      payload.thumbnail_path = urlData.publicUrl;
    }

    // Handle PDF upload
    const pdf = formData.get('pdf') as File | null;
    if (pdf && pdf.size > 0) {
      const ext = pdf.name.split('.').pop() || 'pdf';
      const fileName = `resource-${id}.${ext}`;
      await supabaseAdmin.storage.from('resource-files').upload(fileName, pdf, { contentType: pdf.type, upsert: true });
      const { data: urlData } = supabaseAdmin.storage.from('resource-files').getPublicUrl(fileName);
      payload.file_path = urlData.publicUrl;
    }

    // Handle remove_file flag
    if (formData.get('remove_file') === 'true') {
      payload.file_path = null;
    }

    // Handle remove_thumbnail flag
    if (formData.get('remove_thumbnail') === 'true') {
      payload.thumbnail_path = null;
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
