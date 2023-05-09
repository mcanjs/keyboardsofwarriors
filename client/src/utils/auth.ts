import { jwtVerify } from 'jose';
import { AUTH_PAGES } from './constants';
import { hash } from 'bcryptjs';
import Cookies from 'universal-cookie';

export const getJwtSecretKey = () => {
  const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Jwt secret key not found');
  }

  return new TextEncoder().encode(secretKey);
};

export async function verifyJwtToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch (e) {
    return null;
  }
}

export async function logout(): Promise<boolean> {
  try {
    const cookies = new Cookies();
    const token = cookies.get('token') ?? null;

    if (token === null) throw new Error('Token not found.');
    else cookies.remove('token');

    return true;
  } catch (e) {
    return false;
  }
}

export const isAuthPage = (url: string): boolean => AUTH_PAGES.some((page) => page.startsWith(url));
