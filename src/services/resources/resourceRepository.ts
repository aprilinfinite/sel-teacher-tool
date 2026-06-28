import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Resource } from '@/lib/types';
import type { ResourceQueryParams } from './resourceTypes';

const LOG_PREFIX = '[ResourceRepository]';

/** Build and execute a parameterized Supabase query. */
export async function queryResources(params: ResourceQueryParams): Promise<Resource[]> {
  let query = supabaseAdmin.from('resources').select('*');

  if (params.search) {
    query = query.ilike('title', `%${params.search}%`);
  }
  if (params.category) {
    query = query.eq('category', params.category);
  }
  if (params.gradeLevel) {
    query = query.ilike('grade_level', `%${params.gradeLevel}%`);
  }
  if (params.resourceFormat) {
    query = query.eq('resource_format', params.resourceFormat);
  }
  if (params.featured === 'true') {
    query = query.eq('featured', 1);
  } else if (params.featured === 'false') {
    query = query.eq('featured', 0);
  }

  const [col, dir] = params.sort.split('_');
  const ascending = dir !== 'desc';
  const sortColumn = col === 'downloads' ? 'download_count' : col === 'title' ? 'title' : 'created_at';
  query = query.order(sortColumn, { ascending });

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    console.error(`${LOG_PREFIX} Query failed:`, error.message);
    throw new Error('Failed to load resources');
  }

  return (data as Resource[]) ?? [];
}

/** Count total matching resources (for pagination). */
export async function countResources(params: ResourceQueryParams): Promise<number> {
  let query = supabaseAdmin.from('resources').select('*', { count: 'exact', head: true });

  if (params.search) query = query.ilike('title', `%${params.search}%`);
  if (params.category) query = query.eq('category', params.category);
  if (params.gradeLevel) query = query.ilike('grade_level', `%${params.gradeLevel}%`);
  if (params.resourceFormat) query = query.eq('resource_format', params.resourceFormat);
  if (params.featured === 'true') query = query.eq('featured', 1);
  else if (params.featured === 'false') query = query.eq('featured', 0);

  const { count, error } = await query;
  if (error) { console.error(`${LOG_PREFIX} Count failed:`, error.message); return 0; }
  return count ?? 0;
}

/** Fetch a single resource by id. */
export async function getResourceById(id: number): Promise<Resource | null> {
  const { data, error } = await supabaseAdmin
    .from('resources')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error(`${LOG_PREFIX} getResourceById failed:`, error.message);
    throw new Error('Failed to load resource');
  }

  return (data as Resource) ?? null;
}

/** Update a resource record. Does NOT handle file uploads. */
export async function updateResource(id: number, payload: Record<string, unknown>): Promise<void> {
  const { error } = await supabaseAdmin
    .from('resources')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error(`${LOG_PREFIX} updateResource failed:`, error.message);
    throw new Error('Failed to update resource');
  }
}

/** Delete a single file from Supabase Storage by public URL. Gracefully skips if missing. */
export async function deleteStorageFile(filePath: string | null, bucket: string): Promise<void> {
  if (!filePath) return;
  try {
    const segments = filePath.split('/');
    const fileName = segments[segments.length - 1];
    if (!fileName) return;
    await supabaseAdmin.storage.from(bucket).remove([fileName]);
  } catch {
    console.log(`${LOG_PREFIX} Storage file already missing or could not be deleted: ${filePath}`);
  }
}

/** Delete a resource row from the database. */
export async function deleteResourceById(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('resources')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`${LOG_PREFIX} deleteResourceById failed:`, error.message);
    throw new Error('Failed to delete resource');
  }
}

/** Update only the status column of a resource. */
export async function updateStatusById(id: number, status: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('resources')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error(`${LOG_PREFIX} updateStatusById failed:`, error.message);
    throw new Error('Failed to update status');
  }
}

/** Update only the featured column of a resource. */
export async function updateFeaturedById(id: number, featured: boolean): Promise<void> {
  const { error } = await supabaseAdmin
    .from('resources')
    .update({ featured: featured ? 1 : 0 })
    .eq('id', id);

  if (error) {
    console.error(`${LOG_PREFIX} updateFeaturedById failed:`, error.message);
    throw new Error('Failed to update featured');
  }
}
