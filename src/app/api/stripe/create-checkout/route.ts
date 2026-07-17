import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { fetchProduct } from '@/services/products/productService';
import { getBundleById } from '@/services/bundles/bundleRepository';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * POST /api/stripe/create-checkout
 *
 * Creates a Stripe Checkout Session for a product or bundle.
 *
 * Body:
 *   type: 'product' | 'bundle'
 *   id: number (product ID) or string (bundle UUID)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: 'type and id are required' },
        { status: 400 },
      );
    }

    const stripe = getStripe();

    if (type === 'product') {
      const product = await fetchProduct(Number(id));
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      if (!product.stripePriceId) {
        return NextResponse.json(
          { error: 'Product does not have a Stripe price configured' },
          { status: 400 },
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price: product.stripePriceId,
            quantity: 1,
          },
        ],
        success_url: `${BASE_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/purchase/cancelled`,
        metadata: {
          type: 'product',
          productId: String(product.id),
          resourceId: String(product.resourceId),
        },
      });

      return NextResponse.json({ url: session.url });
    }

    if (type === 'bundle') {
      const bundle = await getBundleById(id);
      if (!bundle) {
        return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
      }

      if (!bundle.stripe_price_id) {
        return NextResponse.json(
          { error: 'Bundle does not have a Stripe price configured' },
          { status: 400 },
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price: bundle.stripe_price_id,
            quantity: 1,
          },
        ],
        success_url: `${BASE_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/purchase/cancelled`,
        metadata: {
          type: 'bundle',
          bundleId: bundle.id,
          resourceId: String(bundle.resource_id),
        },
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json(
      { error: 'Invalid type. Must be "product" or "bundle".' },
      { status: 400 },
    );
  } catch (err) {
    console.error('[StripeCheckoutAPI] Error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
