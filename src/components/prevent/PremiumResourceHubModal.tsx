'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Resource as DbResource } from '@/lib/types';
import type { ProductItem } from '@/services/products/productTypes';
import type { BundleItem } from '@/services/bundles/bundleTypes';
import type { BundlePricingResult } from '@/services/bundles/bundlePricing';
import ProductDetailModal from './ProductDetailModal';
import BundleDetailModal from './BundleDetailModal';

// --- Types ---

export type BundleWithProducts = BundleItem & {
  includedProducts: ProductItem[];
  pricing: BundlePricingResult | null;
};

type PremiumResourceHubModalProps = {
  resource: DbResource;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
};

// --- Helpers ---

function hasValue(val: string | number | null | undefined): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  return true;
}

const formatPrice = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '';
  return `$${val.toFixed(2)}`;
};

// --- Component ---

export default function PremiumResourceHubModal({
  resource,
  onClose,
  triggerRef,
}: PremiumResourceHubModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Data state
  const [products, setProducts] = useState<ProductItem[] | null>(null);
  const [bundleData, setBundleData] = useState<BundleWithProducts | null>(null);
  const [loading, setLoading] = useState(true);

  // Sub-modal state (Buy Now / Buy Bundle inside the hub)
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<BundleWithProducts | null>(null);

  // Fetch premium data
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [productsRes, bundleRes] = await Promise.all([
          fetch(`/api/products/resource/${resource.id}/published`),
          fetch(`/api/bundles/resource/${resource.id}/with-products`),
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
        console.error('[PremiumResourceHubModal] Error:', err);
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
  }, [resource.id]);

  // Save previous focus and trap focus
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';

    // Focus the modal
    setTimeout(() => {
      modalRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = '';
      // Restore focus to trigger button
      if (triggerRef?.current) {
        triggerRef.current.focus();
      } else if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [onClose, triggerRef]);

  // Keyboard: ESC to close, trap focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Trap focus
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  const hasProducts = products && products.length > 0;
  const hasBundle = bundleData && bundleData.status === 'Published';

  // Determine CTA text for the trigger button
  const productCount = products?.length || 0;
  const bundleCount = hasBundle ? 1 : 0;

  return (
    <>
      {/* Hub Modal Overlay */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[5vh] backdrop-blur-sm overflow-y-auto"
        style={{ animation: 'hubFadeIn 0.2s ease-out' }}
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`Premium resources for ${resource.title}`}
          className="relative w-full max-w-[900px] rounded-[28px] border border-[#e6e0d0] bg-white shadow-xl outline-none"
          style={{ animation: 'hubScaleIn 0.2s ease-out' }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#6d6d6d] transition hover:bg-white hover:text-[#3b3b3b]"
            aria-label="Close modal"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>

          {/* Scrollable body */}
          <div className="max-h-[85vh] overflow-y-auto">
            {/* Header — Resource Image + Title + Description */}
            <div className="p-6 pb-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                {/* Thumbnail */}
                {hasValue(resource.thumbnail_path) && (
                  <div className="shrink-0 overflow-hidden rounded-[20px] border border-[#e5e1d6] bg-[#eef3e9] shadow-inner w-full sm:w-48 h-40">
                    <img
                      src={resource.thumbnail_path!}
                      alt={resource.thumbnail_alt || resource.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-semibold leading-snug text-[#2f3b31]">{resource.title}</h2>
                  {hasValue(resource.description) && (
                    <p className="mt-2 text-sm leading-6 text-[#6d6d6d]">{resource.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="p-6 text-center text-sm text-[#6d6d6d]">
                Loading premium resources...
              </div>
            )}

            {/* Empty state */}
            {!loading && !hasProducts && !hasBundle && (
              <div className="p-6 text-center">
                <div className="rounded-[20px] border border-[#f0ece3] bg-[#faf9f6] p-8">
                  <p className="text-sm text-[#6d6d6d]">No premium resources are available yet.</p>
                </div>
              </div>
            )}

            {/* Individual Premium Resources Section */}
            {!loading && hasProducts && (
              <div className="p-6 pb-0">
                <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a9a88] mb-4">
                  Individual Premium Resources
                </h3>
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
                        onClick={() => setSelectedProduct(product)}
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
            {!loading && hasBundle && bundleData && (
              <div className="p-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a9a88] mb-4">
                  Complete Bundle
                </h3>
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
                    onClick={() => setSelectedBundle(bundleData)}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#8a9a88] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7a8a78]"
                  >
                    Buy Bundle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-modals (Buy Now / Buy Bundle) */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {selectedBundle && (
        <BundleDetailModal
          bundle={selectedBundle}
          includedProducts={selectedBundle.includedProducts}
          pricing={selectedBundle.pricing}
          onClose={() => setSelectedBundle(null)}
        />
      )}

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes hubFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes hubScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
