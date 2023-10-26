import { NextRequest, NextResponse } from 'next/server';
import { isAuthPage, logout, verifyToken } from './utils/auth';

export async function middleware(request: NextRequest) {
  const { url, nextUrl, cookies } = request;
  const { value: token } = cookies.get('token') ?? { value: null };

  const isAuthPageRequested = isAuthPage(nextUrl.pathname);
  const searchParams = new URLSearchParams(nextUrl.searchParams);

  console.log('Request for : ', request.nextUrl.pathname);

  //? Login or similar pages
  if (isAuthPageRequested) {
    if (!token) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', url));
  }

  if (!token) {
    searchParams.set('next', nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?${searchParams}`, url));
  }

  const hasVerifiedToken = token && (await verifyToken(token));
  const response = NextResponse.next();
  response.cookies.set('auth', JSON.stringify(hasVerifiedToken));

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
