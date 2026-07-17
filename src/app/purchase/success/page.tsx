import { getStripe } from '@/lib/stripe';
import { getPurchaseBySessionId } from '@/services/purchases/purchaseRepository';
import Link from 'next/link';
import { DownloadButton } from './DownloadButton';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

/**
 * Formats a date string for display.
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a price in cents to a display string.
 */
function formatAmount(amount: number | null, currency: string | null): string {
  if (amount === null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'USD').toUpperCase(),
  }).format(amount);
}

export default async function PurchaseSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = params.session_id;

  // --- Missing session_id ---
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[28px] border border-[#e6e0d0] bg-white p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-semibold text-[#2f3b31]">Missing Session</h1>
          <p className="mt-3 text-sm text-[#6d6d6d] leading-relaxed">
            No purchase session was provided. If you completed a purchase, please check your email for details.
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

  // --- Verify Stripe Session ---
  let session;
  try {
    const stripe = getStripe();
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error('[PurchaseSuccess] Stripe session retrieval failed:', err instanceof Error ? err.message : String(err));
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[28px] border border-[#e6e0d0] bg-white p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-[#2f3b31]">Verification Error</h1>
          <p className="mt-3 text-sm text-[#6d6d6d] leading-relaxed">
            We could not verify your purchase session. Please try again or contact support.
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

  // --- Verify Payment Status ---
  if (session.payment_status !== 'paid') {
    console.log('[PurchaseSuccess] Payment not completed:', session.payment_status);
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[28px] border border-[#e6e0d0] bg-white p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-semibold text-[#2f3b31]">Payment Not Completed</h1>
          <p className="mt-3 text-sm text-[#6d6d6d] leading-relaxed">
            Payment has not been completed. If you believe this is an error, please contact support.
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

  // --- Verify Purchase Record in Database ---
  let purchase;
  try {
    purchase = await getPurchaseBySessionId(sessionId);
  } catch (err) {
    console.error('[PurchaseSuccess] Database lookup failed:', err instanceof Error ? err.message : String(err));
  }

  if (!purchase) {
    console.log('[PurchaseSuccess] Purchase record not found in database for session:', sessionId);
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[28px] border border-[#e6e0d0] bg-white p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-semibold text-[#2f3b31]">Verification Pending</h1>
          <p className="mt-3 text-sm text-[#6d6d6d] leading-relaxed">
            We could not verify your purchase. Your payment was successful, but the record is still being processed. Please check back shortly.
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

  // --- Cross Validation: Compare Purchase Record with Stripe Session ---
  const sessionEmail = session.customer_details?.email || session.customer_email || '';
  const sessionAmount = session.amount_total != null ? session.amount_total / 100 : null;
  const sessionCurrency = session.currency || null;

  const emailMatch = purchase.customer_email.toLowerCase() === sessionEmail.toLowerCase();
  const amountMatch = purchase.amount === sessionAmount;
  const currencyMatch = purchase.currency === sessionCurrency;

  if (!emailMatch || !amountMatch || !currencyMatch) {
    console.warn('[PurchaseSuccess] Cross-validation mismatch:', {
      emailMatch,
      amountMatch,
      currencyMatch,
      purchaseEmail: purchase.customer_email,
      sessionEmail,
      purchaseAmount: purchase.amount,
      sessionAmount,
      purchaseCurrency: purchase.currency,
      sessionCurrency,
    });
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-[28px] border border-[#e6e0d0] bg-white p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-[#2f3b31]">Verification Error</h1>
          <p className="mt-3 text-sm text-[#6d6d6d] leading-relaxed">
            We could not verify your purchase. Please contact support for assistance.
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

  // --- Determine purchase type ---
  const metadata = purchase.metadata || {};
  const purchaseType = metadata.type as string || 'product';
  const isBundle = purchaseType === 'bundle';
  const purchasedItem = isBundle ? 'Premium Bundle' : 'Premium Resource';

  // --- Success! ---
  console.log('[PurchaseSuccess] Verified successfully:', {
    sessionId,
    email: purchase.customer_email,
    type: purchaseType,
    amount: purchase.amount,
  });

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-[28px] border border-[#e6e0d0] bg-white p-8 shadow-sm">
        {/* Success Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#dff4db] mx-auto">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2f5f2b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="mt-5 text-center text-2xl font-semibold text-[#2f3b31]">Thank You!</h1>
        <p className="mt-1 text-center text-sm text-[#6d6d6d]">Purchase Successful</p>

        {/* Purchase Details */}
        <div className="mt-6 space-y-3 rounded-[20px] border border-[#e6e0d0] bg-[#f8f7f4] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6d6d6d]">Item</span>
            <span className="text-sm font-semibold text-[#2f3b31]">{purchasedItem}</span>
          </div>
          <div className="border-t border-[#e6e0d0]" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6d6d6d]">Date</span>
            <span className="text-sm font-semibold text-[#2f3b31]">{formatDate(purchase.created_at)}</span>
          </div>
          <div className="border-t border-[#e6e0d0]" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6d6d6d]">Email</span>
            <span className="text-sm font-semibold text-[#2f3b31]">{purchase.customer_email}</span>
          </div>
          <div className="border-t border-[#e6e0d0]" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6d6d6d]">Amount</span>
            <span className="text-lg font-bold text-[#2f3b31]">
              {formatAmount(purchase.amount, purchase.currency)}
            </span>
          </div>
          <div className="border-t border-[#e6e0d0]" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6d6d6d]">Reference</span>
            <code className="text-xs text-[#6d6d6d] bg-white px-2 py-0.5 rounded border border-[#e6e0d0]">
              {purchase.stripe_payment_intent || purchase.stripe_session_id.slice(-8)}
            </code>
          </div>
        </div>

        {/* Download Button */}
        <div className="mt-6">
          <DownloadButton
            sessionId={sessionId}
            isBundle={isBundle}
          />
        </div>
      </div>
    </div>
  );
}
