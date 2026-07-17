import { queryResources, countResources, getResourceById, getResourceBySlug, updateResource, insertResource, deleteStorageFile, deleteResourceById, updateStatusById, updateFeaturedById } from './resourceRepository';

import { mapResources, mapResource } from './resourceMapper';
import type { ResourceItem, ResourceQueryParams, PaginatedResponse, ResourceStatus } from './resourceTypes';
import { isValidStatus } from './resourceTypes';
import { countProductsByResourceId } from '@/services/products/productRepository';
import slugify from 'slugify';

function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true });
}

export async function getResources(params: ResourceQueryParams): Promise<PaginatedResponse<ResourceItem>> {
  const [items, totalCount] = await Promise.all([
    queryResources(params),
    countResources(params),
  ]);

  return {
    items: mapResources(items),
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / params.pageSize)),
    },
  };
}

export async function getResource(id: number): Promise<ResourceItem | null> {
  const raw = await getResourceById(id);
  return raw ? mapResource(raw) : null;
}

export async function editResource(id: number, payload: Record<string, unknown>): Promise<void> {
  await updateResource(id, { ...payload, updated_at: new Date().toISOString() });
}

export async function deleteResource(id: number): Promise<void> {
  const raw = await getResourceById(id);
  if (!raw) throw new Error('Resource not found');

  // Check if resource has upsell products — prevent deletion if so
  const productCount = await countProductsByResourceId(id);
  if (productCount > 0) {
    throw new Error(
      `This resource contains ${productCount} Upsell Product${productCount !== 1 ? 's' : ''}. Please delete the Upsell Products before deleting this Resource.`,
    );
  }

  // Delete files from storage — continue even if files are already gone
  await Promise.all([
    deleteStorageFile(raw.file_path, 'resource-files'),
    deleteStorageFile(raw.thumbnail_path, 'resource-thumbnails'),
  ]);

  // Delete the database row
  await deleteResourceById(id);
}

export async function updateResourceStatus(id: number, status: string): Promise<void> {
  if (!isValidStatus(status)) {
    throw new Error(`Invalid status: ${status}. Must be draft, published, or archived.`);
  }
  await updateStatusById(id, status, new Date().toISOString());
}

export async function updateResourceFeatured(id: number, featured: boolean): Promise<void> {
  const raw = await getResourceById(id);
  if (!raw) throw new Error('Resource not found');

  const status = (raw.status as string) || 'draft';
  if (status !== 'published') {
    throw new Error('Only published resources can be featured');
  }

  await updateFeaturedById(id, featured, new Date().toISOString());
}

export async function duplicateResource(id: number): Promise<number> {
  const raw = await getResourceById(id);
  if (!raw) throw new Error('Resource not found');

  // Generate new title with (Copy) suffix
  const newTitle = `${raw.title} (Copy)`;

  // Generate unique slug
  let slug = generateSlug(newTitle);
  let counter = 1;
  while (await getResourceBySlug(slug)) {
    slug = `${generateSlug(newTitle)}-${counter++}`;
  }

  // Build the duplicate payload
  // NOTE: Only include columns that exist in the database schema.
  const payload: Record<string, unknown> = {
    title: newTitle,
    slug,
    category: raw.category,
    status: 'draft', // Always draft
    featured: 0, // Always not featured
    grade_level: raw.grade_level,
    time_needed: raw.time_needed,
    description: raw.description,
    topic_tag: raw.topic_tag,
    resource_format: raw.resource_format,
    sel_skill: raw.sel_skill,
    learner_need: raw.learner_need,
    situation: raw.situation,
    seo_title: raw.seo_title,
    seo_description: raw.seo_description,
    focus_keyword: raw.focus_keyword,
    download_count: 0,
    // Do NOT copy: file_path, thumbnail_path, created_by, created_at, updated_at
  };


  const newId = await insertResource(payload);
  return newId;
}
