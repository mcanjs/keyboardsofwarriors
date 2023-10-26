import { getToken } from '@/src/utils/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/login`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(body),
  });

  const user = await response.json();

  if (response.status === 200 && user.message === 'login' && user.cookie) {
    const token = getToken(user.cookie);
    const response = NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );

    response.cookies.set({
      name: 'token',
      value: token,
      path: '/',
      maxAge: 60 * 60,
    });

    response.cookies.set({
      name: 'auth',
      value: JSON.stringify(user.data),
      path: '/',
      maxAge: 60 * 60,
    });

    return response;
  } else {
    return NextResponse.json(
      {
        success: false,
        message: 'Email or password is incorrect',
      },
      {
        status: 409,
      }
    );
  }
}
