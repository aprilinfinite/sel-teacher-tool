// SubscriberService — validates input, delegates to MailerLiteProvider
// This module has NO UI logic and NO knowledge of MailerLite internals.
// It receives a generic SubscriberContext and passes it to the provider.

import type { SubscriberContext } from './types';
import { createSubscriber } from './mailerlite-provider';

const LOG_PREFIX = '[Subscriber]';

export type SubscribeResult =
  | { ok: true; message: string; subscriberId: string }
  | { ok: false; message: string };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function subscribe(ctx: SubscriberContext): Promise<SubscribeResult> {
  const name = ctx.name.trim();
  const email = ctx.email.trim();
  const signupSource = ctx.signupSource.trim();

  // Validation
  if (!name) {
    console.log(`${LOG_PREFIX} Validation failed: missing name`);
    return { ok: false, message: 'Please enter your name.' };
  }
  if (!email) {
    console.log(`${LOG_PREFIX} Validation failed: missing email`);
    return { ok: false, message: 'Please enter your email address.' };
  }
  if (!isValidEmail(email)) {
    console.log(`${LOG_PREFIX} Validation failed: invalid email format`);
    return { ok: false, message: 'Please enter a valid email address.' };
  }

  console.log(
    `${LOG_PREFIX} Subscribing [source=${signupSource}, page=${ctx.landingPage}` +
      (ctx.firstResource ? `, resource=${ctx.firstResource}` : '') +
      ']',
  );

  // Delegate to provider with the full context
  const result = await createSubscriber(ctx);

  if (result.ok) {
    console.log(`${LOG_PREFIX} Subscription successful [id=${result.subscriberId}]`);
    return {
      ok: true,
      message: "You're all set! Welcome to the community.",
      subscriberId: result.subscriberId,
    };
  }

  if (result.duplicate) {
    // Duplicates are treated as success — the visitor is already subscribed
    console.log(`${LOG_PREFIX} Duplicate subscriber — treating as success`);
    return {
      ok: true,
      message: "You're already on our list! Thanks for being here.",
      subscriberId: '',
    };
  }

  console.log(`${LOG_PREFIX} Subscription failed: ${result.message}`);
  return { ok: false, message: result.message };
}
