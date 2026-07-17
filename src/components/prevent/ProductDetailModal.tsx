'use client';

import { useEffect, useRef, useState } from 'react';
import type { ProductItem } from '@/services/products/productTypes';

type ProductDetailModalProps = {
  product: ProductItem;
  onClose: () => void;
};

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
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
    if (product.stripePriceId) {
      setIsProcessing(true);
      try {
        const res = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'product', id: product.id }),
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
      console.log('Purchase Product', product.id);
    }
  };

  const hasThumbnail = product.thumbnailPath && product.thumbnailPath.trim().length > 0;
  const formattedPrice = product.price !== null && product.price !== undefined
    ? `$${product.price.toFixed(2)}`
    : null;

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
        aria-label={product.title}
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

        {/* Thumbnail */}
        {hasThumbnail && (
          <div className="overflow-hidden rounded-t-[28px] bg-[#eef3e9]">
            <div className="p-3">
              <div className="mx-auto overflow-hidden rounded-[20px] border border-[#e5e1d6] bg-white shadow-inner">
                <img
                  src={product.thumbnailPath!}
                  alt={product.title}
                  className="h-full w-full object-cover max-h-72"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-semibold leading-snug text-[#2f3b31]">{product.title}</h2>

          {product.description && (
            <p className="mt-3 text-sm leading-6 text-[#6d6d6d] whitespace-pre-line">{product.description}</p>
          )}

          {/* Price */}
          {formattedPrice && (
            <div className="mt-6">
              <span className="text-3xl font-bold text-[#2f3b31]">{formattedPrice}</span>
            </div>
          )}

          {/* Purchase button */}
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isProcessing}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#a8b8a0] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#97a78f] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Redirecting...' : 'Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}
