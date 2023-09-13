import IPrivateRoomsCreateParameters from '@/src/interfaces/socket/private-rooms.interface';
import { prisma } from '@/src/libs/prisma';
import { NextRequest, NextResponse } from 'next/server';

function checkParameters(body: IPrivateRoomsCreateParameters) {
  const validParams = {
    words: [100, 150, 200, 250, 300, 350],
    time: [60, 90, 120, 150],
    visibility: [true, false],
    language: ['en', 'tr'],
  };

  const isInvalid = Object.keys(validParams)
    .map((param) => (validParams as any)[param].includes((body as any)[param]))
    .includes(false);

  return !isInvalid;
}

export async function POST(request: NextRequest) {
  const body: IPrivateRoomsCreateParameters = await request.json();

  return NextResponse.json({ success: false, message: 'Room not created' }, { status: 409 });
}
