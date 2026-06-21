import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key';

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 1. Secure Admin directory
  if (pathname.startsWith('/admin')) {
    // Exclude /admin/login page from authentication check
    if (pathname !== '/admin/login') {
      if (!user || user.email !== 'byamuraa@gmail.com') {
        // Redirect unauthorized users to the storefront homepage
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // 2. Secure Customer Account directory
  if (pathname.startsWith('/account')) {
    if (!user) {
      // Redirect unauthenticated users to the homepage
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
