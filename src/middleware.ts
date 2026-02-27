import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect /dashboard routes
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  if (!isDashboard) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Simple token check (full verification happens in API routes)
  // Edge runtime doesn't support Node.js crypto module
  if (token.length < 10) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
