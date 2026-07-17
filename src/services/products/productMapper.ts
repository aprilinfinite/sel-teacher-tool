import type { ProductItem, ProductResponse, ProductStatus } from './productTypes';
import type { Product } from '@/lib/types';

export function mapProduct(raw: Product): ProductItem {
  const status = (raw.status as ProductStatus) || 'draft';
  return {
    id: raw.id,
    resourceId: raw.resource_id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    price: raw.price,
    purchaseUrl: raw.purchase_url,
    stripePriceId: raw.stripe_price_id,
    filePath: raw.file_path,
    thumbnailPath: raw.thumbnail_path,
    status,
    sortOrder: raw.sort_order,
    createdAt: raw.created_at,
  };
}

export function mapProducts(raw: Product[]): ProductItem[] {
  return raw.map(mapProduct);
}

export function mapProductResponse(raw: Product): ProductResponse {
  const status = (raw.status as ProductStatus) || 'draft';
  return {
    id: raw.id,
    resourceId: raw.resource_id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    price: raw.price,
    purchaseUrl: raw.purchase_url,
    stripePriceId: raw.stripe_price_id,
    filePath: raw.file_path,
    thumbnailPath: raw.thumbnail_path,
    status,
    sortOrder: raw.sort_order,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}
