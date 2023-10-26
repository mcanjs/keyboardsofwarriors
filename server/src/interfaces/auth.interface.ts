import { User } from '@prisma/client';
import { Request } from 'express';

export interface DataStoredInToken {
  id: string;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface ILogin {
  id: string;
  email: string;
  username: string;
  rank: number;
  admin: {
    id: string;
    isAdmin: boolean;
  };
}
