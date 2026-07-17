import { supabaseAdmin } from '@/lib/supabase-admin';
import type { PurchaseRow, CreatePurchasePayload } from './purchaseTypes';

const LOG_PREFIX = '[PurchaseRepository]';

/**
 * Check if a purchase with the given Stripe session ID already exists.
 * Used for duplicate detection.
 */
export async function getPurchaseBySessionId(sessionId: string): Promise<PurchaseRow | null> {
  const { data, error } = await supabaseAdmin
    .from('purchases')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();

  if (error) {
    console.error(`${LOG_PREFIX} getPurchaseBySessionId failed:`, error.message);
    throw new Error('Failed to check for existing purchase');
  }

  return data as PurchaseRow | null;
}

/**
 * Insert a new purchase record.
 * Returns the created purchase row.
 */
export async function insertPurchase(payload: CreatePurchasePayload): Promise<PurchaseRow> {
  const { data, error } = await supabaseAdmin
    .from('purchases')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error(`${LOG_PREFIX} insertPurchase failed:`, error.message);
    throw new Error('Failed to record purchase');
  }

  return data as PurchaseRow;
}

/**
 * Fetch all purchases, ordered by most recent first.
 */
export async function getAllPurchases(): Promise<PurchaseRow[]> {
  const { data, error } = await supabaseAdmin
    .from('purchases')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`${LOG_PREFIX} getAllPurchases failed:`, error.message);
    throw new Error('Failed to load purchases');
  }

  return (data as PurchaseRow[]) ?? [];
}

/**
 * Fetch purchases for a specific customer email.
 */
export async function getPurchasesByEmail(email: string): Promise<PurchaseRow[]> {
  const { data, error } = await supabaseAdmin
    .from('purchases')
    .select('*')
    .eq('customer_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`${LOG_PREFIX} getPurchasesByEmail failed:`, error.message);
    throw new Error('Failed to load purchases for email');
  }

  return (data as PurchaseRow[]) ?? [];
}

/**
 * Update download tracking fields for a purchase.
 * Increments download_count and sets last_downloaded_at to now.
 */
export async function updatePurchaseDownload(id: string): Promise<void> {
  // First, get the current download_count
  const { data: current, error: fetchError } = await supabaseAdmin
    .from('purchases')
    .select('download_count')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !current) {
    console.error(`${LOG_PREFIX} updatePurchaseDownload fetch failed:`, fetchError?.message);
    throw new Error('Failed to fetch current download count');
  }

  const newCount = (current.download_count ?? 0) + 1;

  const { error } = await supabaseAdmin
    .from('purchases')
    .update({
      download_count: newCount,
      last_downloaded_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    console.error(`${LOG_PREFIX} updatePurchaseDownload failed:`, error.message);
    throw new Error('Failed to update download tracking');
  }
}
