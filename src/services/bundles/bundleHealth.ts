export interface BundleHealthWarning {
  message: string;
  productTitles: string[];
}

export interface BundleHealthResult {
  healthy: boolean;
  warnings: BundleHealthWarning[];
}

/** Analyze bundle health based on its products. */
export function analyzeBundleHealth(
  products: { title: string; sortOrder: number; price: number | null; purchaseUrl: string | null }[],
): BundleHealthResult {
  const warnings: BundleHealthWarning[] = [];

  // Check for products without prices
  const unpricedProducts = products.filter((p) => p.price === null || p.price === 0);
  if (unpricedProducts.length > 0) {
    warnings.push({
      message: `${unpricedProducts.length} product(s) have no price set.`,
      productTitles: unpricedProducts.map((p) => p.title),
    });
  }

  // Check for products without purchase URLs
  const noUrlProducts = products.filter((p) => !p.purchaseUrl);
  if (noUrlProducts.length > 0) {
    warnings.push({
      message: `${noUrlProducts.length} product(s) have no purchase URL.`,
      productTitles: noUrlProducts.map((p) => p.title),
    });
  }

  // Check for duplicate sort orders
  const sortOrders = products.map((p) => p.sortOrder);
  const duplicates = sortOrders.filter((o, i) => sortOrders.indexOf(o) !== i);
  if (duplicates.length > 0) {
    warnings.push({
      message: `${duplicates.length} product(s) share the same sort order.`,
      productTitles: products
        .filter((p) => duplicates.includes(p.sortOrder))
        .map((p) => p.title),
    });
  }

  return {
    healthy: warnings.length === 0,
    warnings,
  };
}
