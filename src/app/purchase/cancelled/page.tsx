import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Purchase Cancelled',
};

export default function PurchaseCancelledPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[28px] border border-[#e6e0d0] bg-white p-8 text-center shadow-sm">
        <div className="text-5xl mb-4">🛒</div>
        <h1 className="text-2xl font-semibold text-[#2f3b31]">Payment Cancelled</h1>
        <p className="mt-3 text-sm text-[#6d6d6d] leading-relaxed">
          Your payment was cancelled. No charges have been made.
        </p>
        <Link
          href="/prevent"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[#a8b8a0] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#97a78f]"
        >
          Return to Resources
        </Link>
      </div>
    </div>
  );
}
