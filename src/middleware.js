import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the route is an admin route
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminSession = cookies().get('admin_session');

    // If no admin session is found, redirect to login
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 