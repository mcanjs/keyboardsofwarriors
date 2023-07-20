import { prisma } from "@/src/libs/prisma";
import { getJwtSecretKey } from "@/src/utils/auth";
import { compare } from "bcrypt";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

async function userIsAdmin(adminId: string): Promise<boolean> {
  const user = await prisma.admin.findUnique({
    where: {
      id: adminId,
    },
  });

  if (user?.isAdmin) {
    return true;
  }
  return false;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (user) {
    const isPasswordMatching: boolean = await compare(
      body.password,
      user.password
    );
    if (!isPasswordMatching)
      return NextResponse.json(
        {
          success: false,
          message: "Password is not matching",
        },
        {
          status: 409,
        }
      );

    const isAdmin = await userIsAdmin(user.adminId);
    const token = await new SignJWT({
      id: user.id,
      email: body.email,
      isAdmin,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
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
      name: "token",
      value: token,
      path: "/",
    });

    return response;
  } else {
    NextResponse.json(
      {
        success: false,
        message: "User not found",
      },
      {
        status: 409,
      }
    );
  }
}
