import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require auth checks
  const isPublicPath = path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/verify-email') ||
    path.startsWith('/resend-verification') ||
    path.startsWith('/forgot-password');
  
  // Get authentication token from cookies
  const token = request.cookies.get('token')?.value;
  
  // If accessing the login/register page while authenticated, redirect to home
  if (isPublicPath && token) {
    if (path.startsWith('/login') || path.startsWith('/register')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // Allow public paths and paths with valid token
  return NextResponse.next();
}

// Match all paths except static assets and API routes
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 