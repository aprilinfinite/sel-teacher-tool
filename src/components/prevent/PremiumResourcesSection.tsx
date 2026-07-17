'use client';

import { useEffect, useState } from 'react';
import type { ProductItem } from '@/services/products/productTypes';
import type { BundleItem } from '@/services/bundles/bundleTypes';
import type { BundlePricingResult } from '@/services/bundles/bundlePricing';

export type BundleWithProducts = BundleItem & {
  includedProducts: ProductItem[];
  pricing: BundlePricingResult | null;
};

type PremiumResourcesSectionProps = {
  resourceId: number;
  onOpenProductModal: (product: ProductItem) => void;
  onOpenBundleModal: (bundle: BundleWithProducts) => void;
};

export default function PremiumResourcesSection({
  resourceId,
  onOpenProductModal,
  onOpenBundleModal,
}: PremiumResourcesSectionProps) {
  const [products, setProducts] = useState<ProductItem[] | null>(null);
  const [bundleData, setBundleData] = useState<BundleWithProducts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [productsRes, bundleRes] = await Promise.all([
          fetch(`/api/products/resource/${resourceId}/published`),
          fetch(`/api/bundles/resource/${resourceId}/with-products`),
        ]);

        if (!mounted) return;

        if (productsRes.ok) {
          const productsData = (await productsRes.json()) as ProductItem[];
          setProducts(productsData);
        } else {
          setProducts([]);
        }

        if (bundleRes.ok) {
          const bundleData = (await bundleRes.json()) as BundleWithProducts | null;
          setBundleData(bundleData);
        } else {
          setBundleData(null);
        }
      } catch (err) {
        console.error('[PremiumResourcesSection] Error:', err);
        if (mounted) {
          setProducts([]);
          setBundleData(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, [resourceId]);

  // Determine if we have anything to show
  const hasProducts = products && products.length > 0;
  const hasBundle = bundleData && bundleData.status === 'Published';

  // If loading, show nothing (don't block the page)
  if (loading) return null;

  // If nothing to show, hide the entire section
  if (!hasProducts && !hasBundle) return null;

  const formatPrice = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return '';
    return `$${val.toFixed(2)}`;
  };

  return (
    <>
      {/* Premium Resources Section */}
      {hasProducts && (
        <div className="mt-5 border-t border-[#f0ece3] pt-5">
          <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a9a88] mb-3">
            Premium Resources
          </h4>
          <div className="space-y-2">
            {products!.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-[16px] border border-[#f0ece3] bg-[#faf9f6] px-4 py-3 shadow-sm transition hover:border-[#e0dccf]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-medium text-[#2f3b31] truncate">{product.title}</span>
                  {product.price !== null && product.price !== undefined && (
                    <span className="text-sm font-semibold text-[#6d6d6d] shrink-0">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onOpenProductModal(product)}
                  className="shrink-0 ml-3 rounded-full bg-[#a8b8a0] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#97a78f]"
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bundle Section */}
      {hasBundle && bundleData && (
        <div className="mt-4 border-t border-[#f0ece3] pt-4">
          <div className="rounded-[20px] border-2 border-[#dce4d4] bg-[#f4f7f1] p-5 shadow-sm">
            <h4 className="text-base font-semibold text-[#2f3b31]">{bundleData.title}</h4>

            {bundleData.includedProducts && bundleData.includedProducts.length > 0 && (
              <p className="mt-1 text-xs text-[#6d6d6d]">
                Includes {bundleData.includedProducts.length} Premium Resource{bundleData.includedProducts.length !== 1 ? 's' : ''}
              </p>
            )}

            {bundleData.pricing && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6d6d6d]">Individual Value</span>
                  <span className="font-semibold text-[#6d6d6d] line-through">
                    {bundleData.pricing.display.totalProductValue}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#2f3b31]">Bundle Price</span>
                  <span className="text-lg font-bold text-[#2f3b31]">
                    {bundleData.pricing.display.bundlePrice}
                  </span>
                </div>
                {bundleData.pricing.savings !== null && bundleData.pricing.savings > 0 && (
                  <div className="flex items-center justify-between rounded-[10px] bg-[#dce8d4] px-3 py-1.5">
                    <span className="text-xs font-semibold text-[#3b5a3b]">You Save</span>
                    <span className="text-xs font-bold text-[#3b5a3b]">
                      {bundleData.pricing.display.savings}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => onOpenBundleModal(bundleData)}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#8a9a88] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7a8a78]"
            >
              Buy Bundle
            </button>
          </div>
        </div>
      )}
    </>
  );
}
