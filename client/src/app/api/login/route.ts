import { prisma } from '@/src/libs/prisma';
import { getJwtSecretKey } from '@/src/utils/auth';
import { compare } from 'bcrypt';
import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const checkUser = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (checkUser) {
    const isPasswordMatching: boolean = await compare(body.password, checkUser.password);
    if (!isPasswordMatching)
      return NextResponse.json(
        {
          success: false,
          message: 'Password is not matching',
        },
        {
          status: 409,
        }
      );

    const token = await new SignJWT({
      email: body.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(getJwtSecretKey());

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
    });

    return response;
  } else {
    NextResponse.json(
      {
        success: false,
        message: 'User not found',
      },
      {
        status: 409,
      }
    );
  }
}
