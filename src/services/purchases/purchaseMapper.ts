import type { PurchaseRow, PurchaseItem } from './purchaseTypes';

/** Map a database row to a UI-friendly PurchaseItem. */
export function mapPurchase(row: PurchaseRow): PurchaseItem {
  return {
    id: row.id,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntent: row.stripe_payment_intent,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    productId: row.product_id,
    bundleId: row.bundle_id,
    resourceId: row.resource_id,
    amount: row.amount,
    currency: row.currency,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    metadata: row.metadata,
    downloadCount: row.download_count,
    lastDownloadedAt: row.last_downloaded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Map an array of database rows to PurchaseItems. */
export function mapPurchases(rows: PurchaseRow[]): PurchaseItem[] {
  return rows.map(mapPurchase);
}
