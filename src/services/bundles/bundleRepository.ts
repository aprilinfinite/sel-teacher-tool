import { supabaseAdmin } from '@/lib/supabase-admin';
import type { BundleResponse } from './bundleTypes';

/** Fetch a bundle by resource ID. */
export async function getBundleByResourceId(resourceId: number): Promise<BundleResponse | null> {
  const { data, error } = await supabaseAdmin
    .from('bundles')
    .select('*')
    .eq('resource_id', resourceId)
    .maybeSingle();

  if (error) {
    console.error('[BundleRepository] getBundleByResourceId:', JSON.stringify(error, null, 2));
    throw error;
  }

  return data as BundleResponse | null;
}

/** Fetch a bundle by its UUID. */
export async function getBundleById(id: string): Promise<BundleResponse | null> {
  const { data, error } = await supabaseAdmin
    .from('bundles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[BundleRepository] getBundleById:', JSON.stringify(error, null, 2));
    throw error;
  }

  return data as BundleResponse | null;
}

/** Fetch all bundles with optional resource title join. */
export async function getAllBundles(): Promise<(BundleResponse & { resource_title?: string })[]> {
  const { data, error } = await supabaseAdmin
    .from('bundles')
    .select('*, resources!inner(title)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[BundleRepository] getAllBundles:', JSON.stringify(error, null, 2));
    throw error;
  }

  return (data as (BundleResponse & { resources?: { title: string } })[]).map((row) => ({
    ...row,
    resource_title: row.resources?.title ?? '',
  }));
}

/** Create a new bundle. */
export async function createBundle(payload: {
  resource_id: number;
  title: string;
  price: number | null;
  purchase_url: string | null;
  stripe_price_id?: string | null;
  thumbnail_path?: string | null;
  status: string;
  created_by?: string | null;
}): Promise<BundleResponse> {
  const { data, error } = await supabaseAdmin
    .from('bundles')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error('[BundleRepository] createBundle:', error.message);
    throw error;
  }

  return data as BundleResponse;
}

/** Update an existing bundle. */
export async function updateBundle(
  id: string,
  payload: Partial<{
    title: string;
    price: number | null;
    purchase_url: string | null;
    stripe_price_id: string | null;
    status: string;
    updated_by: string | null;
  }>,
): Promise<BundleResponse> {
  const { data, error } = await supabaseAdmin
    .from('bundles')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('[BundleRepository] updateBundle:', error.message);
    throw error;
  }

  return data as BundleResponse;
}

/** Delete a bundle by ID. */
export async function deleteBundle(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('bundles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[BundleRepository] deleteBundle:', error.message);
    throw error;
  }
}

// ─── Bundle-Products Junction ────────────────────────────────────

/** Fetch product IDs linked to a bundle. */
export async function getBundleProductIds(bundleId: string): Promise<number[]> {
  const { data, error } = await supabaseAdmin
    .from('bundle_products')
    .select('product_id')
    .eq('bundle_id', bundleId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[BundleRepository] getBundleProductIds:', error.message);
    throw error;
  }

  return (data as { product_id: number }[]).map((row) => row.product_id);
}

/** Replace all product links for a bundle (delete old, insert new). */
export async function setBundleProducts(
  bundleId: string,
  productIds: number[],
): Promise<void> {
  // Delete existing links
  const { error: deleteError } = await supabaseAdmin
    .from('bundle_products')
    .delete()
    .eq('bundle_id', bundleId);

  if (deleteError) {
    console.error('[BundleRepository] setBundleProducts delete:', deleteError.message);
    throw deleteError;
  }

  if (productIds.length === 0) return;

  // Insert new links
  const rows = productIds.map((productId, idx) => ({
    bundle_id: bundleId,
    product_id: productId,
    sort_order: idx,
  }));

  const { error: insertError } = await supabaseAdmin
    .from('bundle_products')
    .insert(rows);

  if (insertError) {
    console.error('[BundleRepository] setBundleProducts insert:', insertError.message);
    throw insertError;
  }
}

