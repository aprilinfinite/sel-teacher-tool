import type { PurchaseItem, CreatePurchasePayload } from './purchaseTypes';
import { mapPurchase, mapPurchases } from './purchaseMapper';
import {
  getPurchaseBySessionId,
  insertPurchase,
  getAllPurchases,
  getPurchasesByEmail,
} from './purchaseRepository';

const LOG_PREFIX = '[PurchaseService]';

/**
 * Record a new purchase from a Stripe Checkout session.
 * Returns the created purchase, or null if a duplicate was detected.
 */
export async function recordPurchase(payload: CreatePurchasePayload): Promise<PurchaseItem | null> {
  // Duplicate detection: check if this Stripe session was already recorded
  const existing = await getPurchaseBySessionId(payload.stripe_session_id);
  if (existing) {
    console.log(`${LOG_PREFIX} Duplicate purchase detected for session: ${payload.stripe_session_id}`);
    return null;
  }

  const row = await insertPurchase(payload);
  console.log(`${LOG_PREFIX} Purchase recorded:`, {
    id: row.id,
    session: row.stripe_session_id,
    email: row.customer_email,
    productId: row.product_id,
    bundleId: row.bundle_id,
    amount: row.amount,
  });

  return mapPurchase(row);
}

/**
 * Get all purchases, most recent first.
 */
export async function fetchAllPurchases(): Promise<PurchaseItem[]> {
  const rows = await getAllPurchases();
  return mapPurchases(rows);
}

/**
 * Get purchases for a specific customer email.
 */
export async function fetchPurchasesByEmail(email: string): Promise<PurchaseItem[]> {
  const rows = await getPurchasesByEmail(email);
  return mapPurchases(rows);
}

/**
 * Check if a purchase already exists for a given Stripe session ID.
 */
export async function isDuplicateSession(sessionId: string): Promise<boolean> {
  const existing = await getPurchaseBySessionId(sessionId);
  return existing !== null;
}
