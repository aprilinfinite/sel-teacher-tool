import { supabaseAdmin } from '@/lib/supabase-admin';
import type { Product } from '@/lib/types';

const LOG_PREFIX = '[ProductRepository]';

/** Fetch all products, ordered by sort_order. */
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error(`${LOG_PREFIX} getAllProducts failed:`, error.message);
    throw new Error('Failed to load products');
  }

  return (data as Product[]) ?? [];
}

/** Fetch all published products belonging to a specific resource. */
export async function getPublishedProductsByResourceId(resourceId: number): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('resource_id', resourceId)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error(`${LOG_PREFIX} getPublishedProductsByResourceId failed:`, error.message);
    throw new Error('Failed to load published products for resource');
  }

  return (data as Product[]) ?? [];
}

/** Fetch all products belonging to a specific resource (all statuses). */
export async function getProductsByResourceId(resourceId: number): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('resource_id', resourceId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error(`${LOG_PREFIX} getProductsByResourceId failed:`, error.message);
    throw new Error('Failed to load products for resource');
  }

  return (data as Product[]) ?? [];
}

/** Fetch a single product by slug. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error(`${LOG_PREFIX} getProductBySlug failed:`, error.message);
    throw new Error('Failed to load product');
  }

  return (data as Product) ?? null;
}

/** Fetch a single product by id. */
export async function getProductById(id: number): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error(`${LOG_PREFIX} getProductById failed:`, error.message);
    throw new Error('Failed to load product');
  }

  return (data as Product) ?? null;
}

/** Insert a new product row. Returns the inserted product. */
export async function insertProduct(payload: Record<string, unknown>): Promise<Product> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    console.error(`${LOG_PREFIX} insertProduct failed:`, error.message);
    throw new Error('Failed to create product');
  }

  return data as Product;
}

/** Update a product row. */
export async function updateProduct(id: number, payload: Record<string, unknown>): Promise<void> {
  const { error } = await supabaseAdmin
    .from('products')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error(`${LOG_PREFIX} updateProduct failed:`, error.message);
    throw new Error('Failed to update product');
  }
}

/** Delete a product row by id. */
export async function deleteProductById(id: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`${LOG_PREFIX} deleteProductById failed:`, error.message);
    throw new Error('Failed to delete product');
  }
}

/** Delete a single file from Supabase Storage by path. Gracefully skips if missing. */
export async function deleteProductStorageFile(filePath: string | null, bucket: string): Promise<void> {
  if (!filePath) return;
  try {
    const segments = filePath.split('/');
    const fileName = segments[segments.length - 1];
    if (!fileName) return;
    await supabaseAdmin.storage.from(bucket).remove([fileName]);
  } catch {
    console.log(`${LOG_PREFIX} Storage file already missing or could not be deleted: ${filePath}`);
  }
}

/** Check if a slug is already taken (excluding a specific product id). */
export async function isSlugTaken(slug: string, excludeId?: number): Promise<boolean> {
  let query = supabaseAdmin
    .from('products')
    .select('id')
    .eq('slug', slug);

  if (excludeId !== undefined) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error(`${LOG_PREFIX} isSlugTaken failed:`, error.message);
    throw new Error('Failed to check slug uniqueness');
  }

  return data !== null;
}

/** Count how many products belong to a resource. */
export async function countProductsByResourceId(resourceId: number): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('resource_id', resourceId);

  if (error) {
    console.error(`${LOG_PREFIX} countProductsByResourceId failed:`, error.message);
    throw new Error('Failed to count products for resource');
  }

  return count ?? 0;
}

/** Get the maximum sort_order for products belonging to a resource. */
export async function getMaxProductSortOrder(resourceId: number): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('sort_order')
    .eq('resource_id', resourceId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`${LOG_PREFIX} getMaxProductSortOrder failed:`, error.message);
    throw new Error('Failed to get max sort order');
  }

  return (data as { sort_order: number } | null)?.sort_order ?? 0;
}
