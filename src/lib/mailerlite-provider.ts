// MailerLiteProvider — communicates with MailerLite API
// This is the ONLY module that knows MailerLite implementation details.

import type { SubscriberContext } from './types';

const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api';
const MAILERLITE_API_KEY_ENV = 'MAILERLITE_API_KEY';
const MAILERLITE_GROUP_ID_ENV = 'MAILERLITE_GROUP_ID';
const LOG_PREFIX = '[MailerLite]';
const REQUEST_TIMEOUT_MS = 10_000;

export type MailerLiteResult =
  | { ok: true; subscriberId: string }
  | { ok: false; duplicate: boolean; message: string };

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }
  return value;
}

/**
 * Build the MailerLite request body from a generic SubscriberContext.
 * The provider is the ONLY module that knows MailerLite field names.
 */
function buildMailerLitePayload(ctx: SubscriberContext) {
  const fields: Record<string, string> = {
    name: ctx.name,
  };

  // Only include custom fields when they have meaningful values
  const customFields: string[] = [];
  if (ctx.signupSource) {
    fields.signup_source = ctx.signupSource;
    customFields.push('signup_source');
  }
  if (ctx.landingPage) {
    fields.landing_page = ctx.landingPage;
    customFields.push('landing_page');
  }
  if (ctx.firstResource) {
    fields.first_resource = ctx.firstResource;
    customFields.push('first_resource');
  }

  if (customFields.length > 0) {
    console.log(`${LOG_PREFIX} Custom fields mapped: ${customFields.join(', ')}`);
  }

  const payload: Record<string, unknown> = {
    email: ctx.email,
    fields,
  };

  // Add group membership when a Group ID is configured
  const groupId = process.env[MAILERLITE_GROUP_ID_ENV];
  if (groupId) {
    payload.groups = [groupId];
    console.log(`${LOG_PREFIX} Subscriber will be added to group: ${groupId}`);
  } else {
    console.warn(
      `${LOG_PREFIX} ${MAILERLITE_GROUP_ID_ENV} is not set. ` +
        `Subscribers will NOT be added to any group. ` +
        `Add ${MAILERLITE_GROUP_ID_ENV}=<your_group_id> to .env.local to enable group membership.`,
    );
  }

  return payload;
}

export async function createSubscriber(
  ctx: SubscriberContext,
): Promise<MailerLiteResult> {
  // Validate API key early — configuration error, not a network error
  let apiKey: string;
  try {
    apiKey = getEnv(MAILERLITE_API_KEY_ENV);
  } catch {
    console.error(
      `${LOG_PREFIX} ${MAILERLITE_API_KEY_ENV} is missing. ` +
        `Add ${MAILERLITE_API_KEY_ENV}=<your_api_key> to .env.local to enable subscriptions.`,
    );
    return {
      ok: false,
      duplicate: false,
      message: 'Service temporarily unavailable. Please try again later.',
    };
  }

  const body = buildMailerLitePayload(ctx);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${MAILERLITE_API_URL}/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.ok) {
      const data = await response.json();
      const subscriberId = String(data.data?.id ?? '');
      console.log(`${LOG_PREFIX} Subscriber added [id=${subscriberId}]`);
      return { ok: true, subscriberId };
    }

    // Handle duplicate subscriber (409 Conflict) — still treated as success
    if (response.status === 409) {
      console.log(`${LOG_PREFIX} Subscriber already exists (409 Conflict)`);
      return { ok: false, duplicate: true, message: 'You are already on our list!' };
    }

    // Other API errors — log details server-side, return user-safe message
    let errorDetail = '';
    try {
      const errorBody = await response.json();
      errorDetail = JSON.stringify(errorBody);
    } catch {
      errorDetail = '(unable to parse error body)';
    }
    console.error(
      `${LOG_PREFIX} API error [status=${response.status}]: ${errorDetail}`,
    );
    return {
      ok: false,
      duplicate: false,
      message: 'Unable to subscribe. Please try again.',
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error(`${LOG_PREFIX} Request timed out after ${REQUEST_TIMEOUT_MS}ms`);
      return {
        ok: false,
        duplicate: false,
        message: 'Service is taking longer than expected. Please try again.',
      };
    }

    // Network or other fetch-level errors
    console.error(
      `${LOG_PREFIX} Network/fetch error: ${err instanceof Error ? err.message : String(err)}`,
    );
    return {
      ok: false,
      duplicate: false,
      message: 'Network error. Please check your connection and try again.',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
