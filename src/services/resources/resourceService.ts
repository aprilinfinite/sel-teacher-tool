import { queryResources, countResources, getResourceById, updateResource, deleteStorageFile, deleteResourceById, updateStatusById, updateFeaturedById } from './resourceRepository';
import { mapResources, mapResource } from './resourceMapper';
import type { ResourceItem, ResourceQueryParams, PaginatedResponse, ResourceStatus } from './resourceTypes';
import { isValidStatus } from './resourceTypes';

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
  await updateResource(id, payload);
}

export async function deleteResource(id: number): Promise<void> {
  const raw = await getResourceById(id);
  if (!raw) throw new Error('Resource not found');

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
  await updateStatusById(id, status);
}

export async function updateResourceFeatured(id: number, featured: boolean): Promise<void> {
  const raw = await getResourceById(id);
  if (!raw) throw new Error('Resource not found');

  const status = (raw.status as string) || 'draft';
  if (status !== 'published') {
    throw new Error('Only published resources can be featured');
  }

  await updateFeaturedById(id, featured);
}
