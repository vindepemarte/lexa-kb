import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  // Only protect /dashboard and /api routes (except auth)
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isProtectedApi = request.nextUrl.pathname.startsWith('/api') && 
                         !request.nextUrl.pathname.startsWith('/api/auth');

  if (!isDashboard && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    if (isDashboard) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = verifyToken(token);

  if (!user) {
    if (isDashboard) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Add user to request headers for API routes
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.id.toString());
  response.headers.set('x-user-email', user.email);

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
