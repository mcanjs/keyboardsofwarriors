import { AUTH_PAGES } from './constants';
import Cookies from 'universal-cookie';

export const getToken = (cookieStr: string) => {
  let token = '';
  const clearSpaces = cookieStr.replaceAll(' ', '');
  const cookieItems = clearSpaces.split(';');

  cookieItems.forEach((cookie) => {
    if (cookie.includes('Authorization')) {
      token = cookie.replace('Authorization=', '');
    }
  });

  return token;
};

export async function verifyToken(token: string) {
  try {
    if (token) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-cache',
      });
      if (response.status === 200) {
        const { data } = await response.json();
        return data;
      }
    }
    return null;
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
