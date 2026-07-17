import type { BundleItem, BundleResponse } from './bundleTypes';

/** Map a database response row to a UI-friendly BundleItem. */
export function mapBundleResponse(row: BundleResponse): BundleItem {
  return {
    id: row.id,
    resourceId: row.resource_id,
    title: row.title,
    price: row.price,
    purchaseUrl: row.purchase_url,
    stripePriceId: row.stripe_price_id,
    thumbnailPath: row.thumbnail_path,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}
