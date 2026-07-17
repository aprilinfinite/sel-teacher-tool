import {
  getAllProducts,
  getPublishedProductsByResourceId,
  getProductsByResourceId,
  getProductBySlug,
  getProductById,
  insertProduct,
  updateProduct,
  deleteProductById,
  deleteProductStorageFile,
  isSlugTaken,
  getMaxProductSortOrder,
} from './productRepository';
import { mapProducts, mapProduct, mapProductResponse } from './productMapper';
import type { ProductItem, ProductResponse } from './productTypes';
import { isValidProductStatus } from './productTypes';
import { supabaseAdmin } from '@/lib/supabase-admin';
import slugify from 'slugify';

function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true });
}

/** Fetch all published products. */
export async function fetchAllProducts(): Promise<ProductItem[]> {
  const items = await getAllProducts();
  return mapProducts(items);
}

/** Fetch all published products for a specific resource. */
export async function fetchPublishedProductsByResource(resourceId: number): Promise<ProductItem[]> {
  const items = await getPublishedProductsByResourceId(resourceId);
  return mapProducts(items);
}

/** Fetch all products for a specific resource (all statuses). */
export async function fetchProductsByResource(resourceId: number): Promise<ProductItem[]> {
  const items = await getProductsByResourceId(resourceId);
  return mapProducts(items);
}

/** Fetch a single product by slug. */
export async function fetchProductBySlug(slug: string): Promise<ProductResponse | null> {
  const raw = await getProductBySlug(slug);
  return raw ? mapProductResponse(raw) : null;
}

/** Fetch a single product by id. */
export async function fetchProduct(id: number): Promise<ProductItem | null> {
  const raw = await getProductById(id);
  return raw ? mapProduct(raw) : null;
}

/** Create a new product with file uploads. */
export async function createProduct(
  payload: Record<string, unknown>,
  pdfFile: File | null,
  thumbnailFile: File | null,
): Promise<ProductResponse> {
  const title = payload.title as string;
  const resourceId = payload.resource_id as number;

  if (!title || !resourceId) {
    throw new Error('Title and resource_id are required');
  }

  // Use provided slug or generate from title
  const providedSlug = payload.slug as string | undefined;
  const baseSlug = providedSlug || generateSlug(title);
  let slug = baseSlug;
  let counter = 1;
  while (await isSlugTaken(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  // Get resource slug for folder naming
  const { data: resource } = await supabaseAdmin
    .from('resources')
    .select('slug')
    .eq('id', resourceId)
    .single();

  const resourceSlug = (resource as { slug: string } | null)?.slug ?? `resource-${resourceId}`;

  let pdfPath: string | null = null;
  let thumbnailPath: string | null = null;

  // Upload PDF to product-files bucket under resource slug folder
  if (pdfFile && pdfFile.size > 0) {
    const ext = pdfFile.name.split('.').pop() || 'pdf';
    const fileName = `${resourceSlug}/${slug}.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-files')
      .upload(fileName, pdfFile, { contentType: pdfFile.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage
      .from('product-files')
      .getPublicUrl(fileName);

    pdfPath = urlData.publicUrl;
  }

  // Upload thumbnail to product-thumbnails bucket under resource slug folder
  if (thumbnailFile && thumbnailFile.size > 0) {
    const ext = thumbnailFile.name.split('.').pop() || 'jpg';
    const fileName = `${resourceSlug}/${slug}-thumb.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-thumbnails')
      .upload(fileName, thumbnailFile, { contentType: thumbnailFile.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage
      .from('product-thumbnails')
      .getPublicUrl(fileName);

    thumbnailPath = urlData.publicUrl;
  }

  const insertPayload: Record<string, unknown> = {
    resource_id: resourceId,
    title,
    slug,
    description: payload.description || null,
    price: payload.price ?? null,
    purchase_url: payload.purchase_url || null,
    stripe_price_id: payload.stripe_price_id || null,
    file_path: pdfPath,
    thumbnail_path: thumbnailPath,
    status: payload.status || 'draft',
    sort_order: payload.sort_order ?? 0,
  };

  const inserted = await insertProduct(insertPayload);
  return mapProductResponse(inserted);
}

/** Update an existing product with optional file replacements. */
export async function editProduct(
  id: number,
  payload: Record<string, unknown>,
  pdfFile: File | null,
  thumbnailFile: File | null,
): Promise<void> {
  const existing = await getProductById(id);
  if (!existing) throw new Error('Product not found');

  // Get resource slug for folder naming
  const { data: resource } = await supabaseAdmin
    .from('resources')
    .select('slug')
    .eq('id', existing.resource_id)
    .single();

  const resourceSlug = (resource as { slug: string } | null)?.slug ?? `resource-${existing.resource_id}`;

  const updatePayload: Record<string, unknown> = { ...payload };

  // Handle PDF replacement
  if (pdfFile && pdfFile.size > 0) {
    // Delete old file
    await deleteProductStorageFile(existing.file_path, 'product-files');

    const ext = pdfFile.name.split('.').pop() || 'pdf';
    const fileName = `${resourceSlug}/${existing.slug}.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-files')
      .upload(fileName, pdfFile, { contentType: pdfFile.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage
      .from('product-files')
      .getPublicUrl(fileName);

    updatePayload.file_path = urlData.publicUrl;
  }

  // Handle thumbnail replacement
  if (thumbnailFile && thumbnailFile.size > 0) {
    // Delete old file
    await deleteProductStorageFile(existing.thumbnail_path, 'product-thumbnails');

    const ext = thumbnailFile.name.split('.').pop() || 'jpg';
    const fileName = `${resourceSlug}/${existing.slug}-thumb.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-thumbnails')
      .upload(fileName, thumbnailFile, { contentType: thumbnailFile.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage
      .from('product-thumbnails')
      .getPublicUrl(fileName);

    updatePayload.thumbnail_path = urlData.publicUrl;
  }

  // Handle remove_file flag
  if (payload.remove_file === 'true') {
    await deleteProductStorageFile(existing.file_path, 'product-files');
    updatePayload.file_path = null;
  }

  // Handle remove_thumbnail flag
  if (payload.remove_thumbnail === 'true') {
    await deleteProductStorageFile(existing.thumbnail_path, 'product-thumbnails');
    updatePayload.thumbnail_path = null;
  }

  // Always update the timestamp
  updatePayload.updated_at = new Date().toISOString();

  await updateProduct(id, updatePayload);
}

/** Delete a product and its associated storage files. */
export async function deleteProduct(id: number): Promise<void> {
  const raw = await getProductById(id);
  if (!raw) throw new Error('Product not found');

  // Delete files from storage
  await Promise.all([
    deleteProductStorageFile(raw.file_path, 'product-files'),
    deleteProductStorageFile(raw.thumbnail_path, 'product-thumbnails'),
  ]);

  // Delete the database row
  await deleteProductById(id);
}

/** Update a product's status. */
export async function updateProductStatus(id: number, status: string): Promise<void> {
  if (!isValidProductStatus(status)) {
    throw new Error(`Invalid status: ${status}. Must be draft, published, or archived.`);
  }
  await updateProduct(id, { status, updated_at: new Date().toISOString() });
}

/** Duplicate a product. Does NOT copy uploaded files, slug, or Stripe links. */
export async function duplicateProduct(id: number): Promise<ProductResponse> {
  const existing = await getProductById(id);
  if (!existing) throw new Error('Product not found');

  const baseSlug = generateSlug(`${existing.title}-Copy`);
  let slug = baseSlug;
  let counter = 1;
  while (await isSlugTaken(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const maxOrder = await getMaxProductSortOrder(existing.resource_id);

  const insertPayload: Record<string, unknown> = {
    resource_id: existing.resource_id,
    title: `${existing.title} (Copy)`,
    slug,
    description: existing.description,
    price: existing.price,
    purchase_url: null,
    file_path: null,
    thumbnail_path: null,
    status: 'draft',
    sort_order: maxOrder + 1,
  };

  const inserted = await insertProduct(insertPayload);
  return mapProductResponse(inserted);
}
