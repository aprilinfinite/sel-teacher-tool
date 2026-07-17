import type { BundleItem, BundleFormData } from './bundleTypes';
import { mapBundleResponse } from './bundleMapper';
import {
  getBundleByResourceId,
  getAllBundles,
  createBundle,
  updateBundle,
  deleteBundle,
  getBundleProductIds,
  setBundleProducts,
} from './bundleRepository';

/** Fetch a bundle by resource ID, including linked product IDs. */
export async function getBundle(resourceId: number): Promise<(BundleItem & { productIds?: number[] }) | null> {
  const row = await getBundleByResourceId(resourceId);
  if (!row) return null;

  const bundle = mapBundleResponse(row);
  const productIds = await getBundleProductIds(bundle.id);
  return { ...bundle, productIds };
}

/** List all bundles with resource info. */
export async function listAllBundles(): Promise<(BundleItem & { resourceTitle?: string })[]> {
  const rows = await getAllBundles();
  return rows.map((row) => ({
    ...mapBundleResponse(row),
    resourceTitle: row.resource_title ?? '',
  }));
}

/** Save (create or update) a bundle for a resource, including linked products. */
export async function saveBundle(
  resourceId: number,
  formData: BundleFormData,
  bundleId?: string | null,
  adminEmail?: string | null,
  thumbnailPath?: string | null,
): Promise<BundleItem> {
  const rawPrice = formData.price ? parseFloat(formData.price) : null;
  const price = rawPrice !== null && !isNaN(rawPrice) ? rawPrice : null;

  let bundle: BundleItem;

  if (bundleId) {
    const updatePayload: Record<string, unknown> = {
      title: formData.title,
      price,
      purchase_url: formData.purchaseUrl || null,
      stripe_price_id: null,
      status: formData.status,
      updated_by: adminEmail || null,
    };
    // Only include thumbnail_path if explicitly provided
    if (thumbnailPath !== undefined) {
      updatePayload.thumbnail_path = thumbnailPath;
    }
    const row = await updateBundle(bundleId, updatePayload as Parameters<typeof updateBundle>[1]);
    bundle = mapBundleResponse(row);
  } else {
    const createPayload = {
      resource_id: resourceId,
      title: formData.title,
      price,
      purchase_url: formData.purchaseUrl || null,
      stripe_price_id: null,
      thumbnail_path: thumbnailPath || null,
      status: formData.status,
      created_by: adminEmail || null,
    };
    const row = await createBundle(createPayload);
    bundle = mapBundleResponse(row);
  }

  // Persist linked product IDs
  if (formData.productIds) {
    await setBundleProducts(bundle.id, formData.productIds);
  }

  return bundle;
}

/** Remove a bundle by ID (cascade deletes bundle_products links). */
export async function removeBundle(id: string): Promise<void> {
  await deleteBundle(id);
}
