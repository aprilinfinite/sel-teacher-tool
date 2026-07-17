import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.warn('[Stripe] STRIPE_SECRET_KEY is not set. Stripe operations will fail.');
}

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured in environment variables.');
    }
    stripeInstance = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2026-06-24.dahlia',
    });
  }
  return stripeInstance;
}
