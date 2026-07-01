import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const adminPaths = [
  '/admin',
  '/admin/resources',
  '/admin/blog',
  '/admin/quiz',
  '/admin/subscribers',
];

const publicPaths = [
  '/',
  '/prevent',
  '/login',
  '/api/resources',
  '/api/subscribe',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create the response early so we can attach cookies to it
  const response = NextResponse.next();

  // Create a Supabase SSR client that reads cookies from the request
  // and writes updated cookies to the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Allow public paths and static assets through
  if (
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico'
  ) {
    // If user is authenticated and visiting /login, redirect to /admin
    if (pathname === '/login') {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
    return response;
  }

  // Check if this is an admin path that needs protection
  const isAdminPath = adminPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );

  if (isAdminPath) {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      // No valid session — redirect to login with redirect back
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated — allow through
    return response;
  }

  // All other paths — allow through
  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files, images, etc.
    '/((?!_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)',
  ],
};
