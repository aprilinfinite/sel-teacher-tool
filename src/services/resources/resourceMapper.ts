import type { ResourceItem } from './resourceTypes';
import type { Resource } from '@/lib/types';

import type { ResourceStatus } from './resourceTypes';

export function mapResource(raw: Resource): ResourceItem {
  const status = (raw.status as ResourceStatus) || 'draft';
  // product_count from Supabase subquery returns { count: number } | null
  const productCountRaw = raw.product_count as { count: number } | null | undefined;
  const productCount = productCountRaw?.count ?? 0;
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    category: raw.category,
    gradeLevel: raw.grade_level,
    resourceFormat: raw.resource_format,
    featured: raw.featured === 1,
    downloadCount: raw.download_count ?? 0,
    status,
    displayOrder: raw.display_order ?? 0,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    productCount,
    shortDescription: raw.short_description ?? null,
    resourceDescription: raw.resource_description ?? null,
    tags: raw.tags ?? null,
    timeNeeded: raw.time_needed ?? null,
    materialsNeeded: raw.materials_needed ?? null,
    filePath: raw.file_path ?? null,
    thumbnailPath: raw.thumbnail_path ?? null,
    thumbnailAlt: raw.thumbnail_alt ?? null,
    resourceType: raw.resource_type ?? null,
    createdBy: raw.created_by ?? null,
    updatedBy: raw.updated_by ?? null,
  };
}

export function mapResources(raw: Resource[]): ResourceItem[] {
  return raw.map(mapResource);
}
