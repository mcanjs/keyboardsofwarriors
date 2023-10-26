import { NextRequest, NextResponse } from 'next/server';
import { isAuthPage, logout, verifyToken } from './utils/auth';

export async function middleware(request: NextRequest) {
  const { url, nextUrl, cookies } = request;
  const { value: token } = cookies.get('token') ?? { value: null };
  const isAuthPageRequested = isAuthPage(nextUrl.pathname);
  const searchParams = new URLSearchParams(nextUrl.searchParams);
  const response = NextResponse.next();

  if (request.method === 'OPTIONS' || request.method === 'HEAD') {
    return response;
  }

  //? Login or similar pages
  if (isAuthPageRequested) {
    if (!token) {
      return response;
    }
    return NextResponse.redirect(new URL('/', url));
  }

  const hasVerifiedToken = token && (await verifyToken(token));
  if (!hasVerifiedToken) {
    cookies.delete(['token', 'auth']);
    searchParams.set('next', nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?${searchParams}`, url));
  }

  return response;
}

export const config = {
  matcher: [
    '/login',
    '/matchmaker',
    '/competitive',
    '/result/:path*',
    '/profile',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/private-rooms/:path*',
  ],
};
