import { NextRequest, NextResponse } from 'next/server';
import { subscribe } from '@/lib/subscriber-service';
import type { SubscriberContext } from '@/lib/types';

const LOG_PREFIX = '[SubscribeAPI]';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, signupSource, firstResource } = body;

    if (!name || !email) {
      console.log(`${LOG_PREFIX} Rejected: missing name or email`);
      return NextResponse.json(
        { ok: false, message: 'Name and email are required.' },
        { status: 400 },
      );
    }

    // Auto-detect landing page from the Referer header.
    // Extract the first URL path segment so future pages work automatically.
    const referer = req.headers.get('referer') || '';
    let landingPage = 'website';
    try {
      const url = new URL(referer);
      const path = url.pathname;
      // Extract the first meaningful path segment slug
      const segments = path.split('/').filter(Boolean);
      if (segments.length > 0) {
        landingPage = segments[0];
      } else {
        landingPage = 'homepage';
      }
    } catch {
      // Invalid referer URL — fallback to 'website'
      landingPage = 'website';
    }

    console.log(
      `${LOG_PREFIX} Request received [source=${signupSource || 'website'}, page=${landingPage}` +
        (firstResource ? `, resource=${firstResource}` : '') +
        ']',
    );

    const ctx: SubscriberContext = {
      name: name.trim(),
      email: email.trim(),
      signupSource: signupSource || 'website',
      landingPage,
      firstResource: firstResource || null,
    };

    const result = await subscribe(ctx);

    if (result.ok) {
      return NextResponse.json({ ok: true, message: result.message });
    }

    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  } catch (err) {
    console.error(
      `${LOG_PREFIX} Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
    );
    return NextResponse.json(
      { ok: false, message: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
