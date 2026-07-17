export interface BundlePricingResult {
  hasBundlePrice: boolean;
  pricedProductCount: number;
  totalProductValue: number;
  bundlePrice: number | null;
  savings: number | null;
  display: {
    totalProductValue: string;
    bundlePrice: string;
    savings: string;
  };
}

/** Calculate bundle pricing summary. */
export function calculateBundlePricing(
  products: { title: string; sortOrder: number; price: number | null; purchaseUrl: string | null }[],
  bundlePrice: number | null,
): BundlePricingResult {
  const pricedProducts = products.filter(
    (p) => p.price !== null && p.price > 0,
  );
  const totalProductValue = pricedProducts.reduce(
    (sum, p) => sum + (p.price ?? 0),
    0,
  );

  const savings =
    bundlePrice !== null && totalProductValue > 0
      ? totalProductValue - bundlePrice
      : null;

  const formatPrice = (val: number): string =>
    `$${val.toFixed(2)}`;

  return {
    hasBundlePrice: bundlePrice !== null,
    pricedProductCount: pricedProducts.length,
    totalProductValue,
    bundlePrice,
    savings,
    display: {
      totalProductValue: formatPrice(totalProductValue),
      bundlePrice:
        bundlePrice !== null ? formatPrice(bundlePrice) : 'Not set',
      savings:
        savings !== null
          ? savings >= 0
            ? formatPrice(savings)
            : `-${formatPrice(Math.abs(savings))}`
          : '—',
    },
  };
}
