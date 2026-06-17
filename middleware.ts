import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Edge-safe base64url decoding of JWT payload
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    const isExpired = payload.exp ? payload.exp * 1000 < Date.now() : false;

    if (payload.role !== 'admin' || isExpired) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

// Protect all /admin routes
export const config = {
  matcher: ['/admin/:path*'],
};
