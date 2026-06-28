import type { ResourceItem } from './resourceTypes';
import type { Resource } from '@/lib/types';

import type { ResourceStatus } from './resourceTypes';

export function mapResource(raw: Resource): ResourceItem {
  const status = (raw.status as ResourceStatus) || 'draft';
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
    createdAt: raw.created_at,
  };
}

export function mapResources(raw: Resource[]): ResourceItem[] {
  return raw.map(mapResource);
}
