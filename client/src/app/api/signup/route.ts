import { prisma } from '@/src/libs/prisma';
import { generateToken, getJwtSecretKey } from '@/src/utils/auth';
import { hash } from 'bcrypt';
import { JWTPayload, SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email, username, password } = await request.json();

  const alreadyHaveUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (alreadyHaveUser) {
    return NextResponse.json(
      {
        success: false,
        message: 'User already exist',
      },
      {
        status: 409,
      }
    );
  }
  const hashedPassword = await hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      premium: {
        create: {
          isPremium: false,
        },
      },
      admin: {
        create: {
          isAdmin: false,
        },
      },
    },
  });

  const tokenData: JWTPayload = {
    id: user.id,
    email,
    username: user.username,
    isAdmin: false,
  };
  const token = await generateToken(tokenData);

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
}
