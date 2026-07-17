'use client';

import { useEffect, useRef, useState } from 'react';
import type { BundleItem } from '@/services/bundles/bundleTypes';
import type { ProductItem } from '@/services/products/productTypes';
import type { BundlePricingResult } from '@/services/bundles/bundlePricing';

type BundleDetailModalProps = {
  bundle: BundleItem;
  includedProducts: ProductItem[];
  pricing: BundlePricingResult | null;
  onClose: () => void;
};

export default function BundleDetailModal({ bundle, includedProducts, pricing, onClose }: BundleDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus the modal
    setTimeout(() => {
      modalRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handlePurchase = async () => {
    if (bundle.stripePriceId) {
      setIsProcessing(true);
      try {
        const res = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'bundle', id: bundle.id }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          console.error('Failed to create checkout session:', data.error);
        }
      } catch (err) {
        console.error('Checkout error:', err);
      } finally {
        setIsProcessing(false);
      }
    } else {
      console.log('Purchase Bundle', bundle.id);
    }
  };

  const formatPrice = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return '—';
    return `$${val.toFixed(2)}`;
  };

  // Use bundle thumbnail if available, otherwise fall back to first product thumbnail
  const hasBundleThumbnail = !!(bundle.thumbnailPath && bundle.thumbnailPath.trim().length > 0);
  const firstProductWithThumbnail = !hasBundleThumbnail
    ? includedProducts.find((p) => p.thumbnailPath && p.thumbnailPath.trim().length > 0)
    : null;
  const thumbnailSrc = hasBundleThumbnail
    ? bundle.thumbnailPath!
    : firstProductWithThumbnail?.thumbnailPath ?? null;
  const showThumbnail = hasBundleThumbnail || !!firstProductWithThumbnail;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={bundle.title}
        className="relative w-full max-w-[650px] rounded-[28px] border border-[#e6e0d0] bg-white shadow-xl outline-none"
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

        {/* Bundle Thumbnail — use bundle thumbnail if available, otherwise first product thumbnail */}
        {showThumbnail && (
          <div className="overflow-hidden rounded-t-[28px] bg-[#eef3e9]">
            <div className="p-3">
              <div className="mx-auto overflow-hidden rounded-[20px] border border-[#e5e1d6] bg-white shadow-inner">
                <img
                  src={thumbnailSrc!}
                  alt={bundle.title}
                  className="h-full w-full object-cover max-h-72"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Bundle Title */}
          <h2 className="text-2xl font-semibold leading-snug text-[#2f3b31]">{bundle.title}</h2>

          {/* Bundle Description */}
          <p className="mt-2 text-sm leading-6 text-[#6d6d6d]">
            Bundle of premium resources at a discounted price.
          </p>

          {/* Included Products — bullet list */}
          {includedProducts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a9a88] mb-3">
                Includes
              </h3>
              <ul className="space-y-2">
                {includedProducts.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 text-sm text-[#2f3b31]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eef3e9] text-xs font-bold text-[#8a9a88]">
                      &bull;
                    </span>
                    <span className="font-medium">{product.title}</span>
                    {product.price !== null && (
                      <span className="ml-auto text-sm font-semibold text-[#6d6d6d]">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing Summary */}
          {pricing && (
            <div className="mt-6 rounded-[20px] border border-[#e6e0d0] bg-[#f8f7f4] p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6d6d6d]">Individual Value</span>
                  <span className="text-sm font-semibold text-[#6d6d6d] line-through">
                    {pricing.display.totalProductValue}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#2f3b31]">Bundle Price</span>
                  <span className="text-xl font-bold text-[#2f3b31]">
                    {pricing.display.bundlePrice}
                  </span>
                </div>
                {pricing.savings !== null && pricing.savings > 0 && (
                  <div className="flex items-center justify-between rounded-[12px] bg-[#e8ede4] px-3 py-2">
                    <span className="text-sm font-semibold text-[#3b5a3b]">You Save</span>
                    <span className="text-sm font-bold text-[#3b5a3b]">
                      {pricing.display.savings}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Purchase button */}
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isProcessing}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#a8b8a0] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#97a78f] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Redirecting...' : 'Buy Bundle'}
          </button>
        </div>
      </div>
    </div>
  );
}
