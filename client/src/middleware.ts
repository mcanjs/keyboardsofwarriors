import { NextRequest, NextResponse } from 'next/server';
import { isAuthPage, logout, verifyJwtToken } from './utils/auth';

export async function middleware(request: NextRequest) {
  const { url, nextUrl, cookies } = request;
  const { value: token } = cookies.get('token') ?? { value: null };

  const hasVerifiedToken = token && (await verifyJwtToken(token));
  const isAuthPageRequested = isAuthPage(nextUrl.pathname);
  const searchParams = new URLSearchParams(nextUrl.searchParams);

  //? Login or similar pages
  if (isAuthPageRequested) {
    if (!hasVerifiedToken) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', url));
  }

  if (!hasVerifiedToken) {
    searchParams.set('next', nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?${searchParams}`, url));
  }

  return NextResponse.next();
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
    '/verification/:path*',
  ],
};
