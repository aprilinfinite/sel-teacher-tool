export type BundleStatus = 'Draft' | 'Published' | 'Inactive';

const VALID_STATUSES: BundleStatus[] = ['Draft', 'Published', 'Inactive'];

export function isValidBundleStatus(s: string): s is BundleStatus {
  return VALID_STATUSES.includes(s as BundleStatus);
}

/** UI-friendly bundle model for the admin list. */
export interface BundleItem {
  id: string;
  resourceId: number;
  title: string;
  price: number | null;
  purchaseUrl: string | null;
  stripePriceId: string | null;
  thumbnailPath: string | null;
  status: BundleStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

/** Form data for creating/editing a bundle. */
export interface BundleFormData {
  title: string;
  price: string;
  purchaseUrl: string;
  status: BundleStatus;
  productIds?: number[];
}


/** API response wrapper for a single bundle. */
export interface BundleResponse {
  id: string;
  resource_id: number;
  title: string;
  price: number | null;
  purchase_url: string | null;
  stripe_price_id: string | null;
  thumbnail_path: string | null;
  status: BundleStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}
