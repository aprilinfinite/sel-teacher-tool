import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { recordPurchase } from '@/services/purchases/purchaseService';

export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events.
 *
 * Workflow:
 * 1. Verify Stripe Signature
 * 2. Ignore unsupported events
 * 3. Handle: checkout.session.completed
 * 4. Extract session details
 * 5. Determine product or bundle purchase from metadata
 * 6. Insert purchase record (with duplicate detection)
 * 7. Return 200 OK
 */
export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event;

    if (WEBHOOK_SECRET) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
      } catch (err) {
        console.error('[StripeWebhook] Signature verification failed:', err instanceof Error ? err.message : String(err));
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // No webhook secret configured — parse raw for development
      try {
        event = JSON.parse(body);
      } catch {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
      }
      console.warn('[StripeWebhook] No STRIPE_WEBHOOK_SECRET set — skipping signature verification');
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Extract session details
        const sessionId: string = session.id;
        const paymentIntent: string | null = session.payment_intent || null;
        const customerEmail: string = session.customer_details?.email || session.customer_email || '';
        const customerName: string | null = session.customer_details?.name || session.customer_name || null;
        const amount: number | null = session.amount_total != null ? session.amount_total / 100 : null;
        const currency: string | null = session.currency || null;
        const paymentStatus: string = session.payment_status || 'unknown';
        const paymentMethod: string | null = session.payment_method_types?.[0] || null;

        // Extract metadata
        const metadata: Record<string, unknown> = session.metadata || {};
        const purchaseType: string | undefined = metadata.type as string | undefined;
        const resourceId: number | null = metadata.resourceId ? parseInt(metadata.resourceId as string, 10) : null;
        const productId: number | null = metadata.productId ? parseInt(metadata.productId as string, 10) : null;
        const bundleId: string | null = (metadata.bundleId as string) || null;

        // Development logging
        console.log('[StripeWebhook] Checkout completed:', {
          sessionId,
          customerEmail,
          purchaseType,
          productId,
          bundleId,
          resourceId,
          amount,
          currency,
          paymentStatus,
        });

        // Determine purchase type from metadata
        if (!purchaseType) {
          console.warn('[StripeWebhook] No purchase type in metadata — skipping purchase record');
          return NextResponse.json({ received: true });
        }

        // Build the purchase payload
        const purchasePayload = {
          stripe_session_id: sessionId,
          stripe_payment_intent: paymentIntent,
          customer_email: customerEmail,
          customer_name: customerName,
          product_id: purchaseType === 'product' ? productId : null,
          bundle_id: purchaseType === 'bundle' ? bundleId : null,
          resource_id: resourceId,
          amount: amount,
          currency: currency,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          metadata: metadata,
        };

        // Record the purchase (with duplicate detection)
        const result = await recordPurchase(purchasePayload);

        if (result === null) {
          console.log('[StripeWebhook] Duplicate purchase detected — returning 200');
        } else {
          console.log('[StripeWebhook] Purchase recorded successfully:', result.id);
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        console.log('[StripeWebhook] Checkout expired:', session.id);
        break;
      }

      default:
        console.log(`[StripeWebhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[StripeWebhook] Error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}
