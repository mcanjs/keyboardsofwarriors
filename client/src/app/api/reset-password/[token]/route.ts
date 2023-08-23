import { prisma } from '@/src/libs/prisma';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const passwordResetToken = crypto.createHash('sha256').update(params.token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken,
      passwordResetAt: {
        gt: new Date(),
      },
    },
    select: {
      email: true,
      username: true,
      id: true,
    },
  });

  return NextResponse.json({ user: user ?? false });
}
