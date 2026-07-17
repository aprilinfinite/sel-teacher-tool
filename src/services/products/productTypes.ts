export type ProductStatus = 'draft' | 'published' | 'archived';

const VALID_STATUSES: ProductStatus[] = ['draft', 'published', 'archived'];

export function isValidProductStatus(s: string): s is ProductStatus {
  return VALID_STATUSES.includes(s as ProductStatus);
}

export const PRODUCT_TYPE_OPTIONS = [
  'Printable',
  'Poster',
  'Canva Template',
  'Slides',
  'Workbook',
  'Journal',
  'Flash Cards',
  'Visual Cards',
  'Teacher Guide',
  'Digital Download',
  'Bundle Component',
  'Other',
] as const;

export type ProductType = (typeof PRODUCT_TYPE_OPTIONS)[number];

/** UI-friendly product model for the admin list. */
export interface ProductItem {
  id: number;
  resourceId: number;
  title: string;
  slug: string;
  description: string | null;
  price: number | null;
  purchaseUrl: string | null;
  stripePriceId: string | null;
  filePath: string | null;
  thumbnailPath: string | null;
  status: ProductStatus;
  sortOrder: number;
  createdAt: string;
}

/** API response wrapper for a single product. */
export interface ProductResponse {
  id: number;
  resourceId: number;
  title: string;
  slug: string;
  description: string | null;
  price: number | null;
  purchaseUrl: string | null;
  stripePriceId: string | null;
  filePath: string | null;
  thumbnailPath: string | null;
  status: ProductStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
