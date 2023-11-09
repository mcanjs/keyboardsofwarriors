import { NextRequest, NextResponse } from 'next/server';
import { isAuthPage, verifyJwtToken } from './utils/auth';

export async function middleware(request: NextRequest) {
  const { url, nextUrl, cookies } = request;
  const { value: token } = cookies.get('token') ?? { value: null };
  const isAuthPageRequested = isAuthPage(nextUrl.pathname);
  const searchParams = new URLSearchParams(nextUrl.searchParams);
  const hasVerifiedToken = token && (await verifyJwtToken(token));

  //? Login or similar pages
  if (isAuthPageRequested) {
    if (!token) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', url));
  }

  if (!hasVerifiedToken) {
    cookies.delete(['token', 'auth']);
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
    '/custom/:path*',
  ],
};
