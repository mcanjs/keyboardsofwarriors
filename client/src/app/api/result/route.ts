import { prisma } from "@/src/libs/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { id } = await request.json();

  console.log(id);

  const data = await prisma.matches.findUnique({
    where: {
      id,
    },
  });

  if (data) {
    return NextResponse.json(
      {
        data,
      },
      {
        status: 200,
      }
    );
  }

  return NextResponse.json(
    {
      data: {},
    },
    {
      status: 409,
    }
  );
}
