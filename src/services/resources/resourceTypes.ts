export type ResourceStatus = 'draft' | 'published' | 'archived';

const VALID_STATUSES: ResourceStatus[] = ['draft', 'published', 'archived'];

export function isValidStatus(s: string): s is ResourceStatus {
  return VALID_STATUSES.includes(s as ResourceStatus);
}

/** UI-friendly resource model for the admin list. */
export interface ResourceItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  gradeLevel: string | null;
  resourceFormat: string | null;
  featured: boolean;
  downloadCount: number;
  status: ResourceStatus;
  createdAt: string;
}

/** Query parameters sent from the UI to the API. */
export interface ResourceQueryParams {
  search: string;
  category: string;
  gradeLevel: string;
  resourceFormat: string;
  featured: string; // '' | 'true' | 'false'
  sort: string;
  page: number;
  pageSize: number;
}

/** Pagination metadata returned by the API. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** API response wrapper. */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/** Default query parameters. */
export const DEFAULT_QUERY: ResourceQueryParams = {
  search: '',
  category: '',
  gradeLevel: '',
  resourceFormat: '',
  featured: '',
  sort: 'created_at_desc',
  page: 1,
  pageSize: 10,
};

/** Sort options for the UI dropdown. */
export const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Newest' },
  { value: 'created_at_asc', label: 'Oldest' },
  { value: 'title_asc', label: 'Title A–Z' },
  { value: 'title_desc', label: 'Title Z–A' },
  { value: 'downloads_desc', label: 'Most Downloaded' },
] as const;
