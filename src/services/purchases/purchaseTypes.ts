/** Raw database row for a purchase record. */
export interface PurchaseRow {
  id: string;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  customer_email: string;
  customer_name: string | null;
  product_id: number | null;
  bundle_id: string | null;
  resource_id: number | null;
  amount: number | null;
  currency: string | null;
  payment_status: string;
  payment_method: string | null;
  metadata: Record<string, unknown> | null;
  download_count: number;
  last_downloaded_at: string | null;
  created_at: string;
  updated_at: string;
}

/** UI-friendly purchase model. */
export interface PurchaseItem {
  id: string;
  stripeSessionId: string;
  stripePaymentIntent: string | null;
  customerEmail: string;
  customerName: string | null;
  productId: number | null;
  bundleId: string | null;
  resourceId: number | null;
  amount: number | null;
  currency: string | null;
  paymentStatus: string;
  paymentMethod: string | null;
  metadata: Record<string, unknown> | null;
  downloadCount: number;
  lastDownloadedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload for inserting a new purchase record. */
export interface CreatePurchasePayload {
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  customer_email: string;
  customer_name: string | null;
  product_id: number | null;
  bundle_id: string | null;
  resource_id: number | null;
  amount: number | null;
  currency: string | null;
  payment_status: string;
  payment_method: string | null;
  metadata: Record<string, unknown> | null;
}

/** Payload for updating download tracking fields. */
export interface UpdateDownloadPayload {
  download_count: number;
  last_downloaded_at: string;
}
