import { SECRET_KEY } from '@/config';
import { DataStoredInToken } from '@/interfaces/auth.interface';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

export const ValidateToken = async (token: string) => {
  const { id } = verify(token, SECRET_KEY) as DataStoredInToken;
  const users = new PrismaClient().user;
  const findUser = await users.findUnique({ where: { id } });

  if (findUser) {
    return true;
  } else {
    return false;
  }
};
