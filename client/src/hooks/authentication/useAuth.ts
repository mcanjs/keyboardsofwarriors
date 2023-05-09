import React from 'react';
import Cookies from 'universal-cookie';
import { verifyJwtToken } from '@/src/utils/auth';
import { JWTPayload } from 'jose';

const useAuthFromServer = async () => {
  const { cookies } = require('next/headers');
  const cookieStore = cookies();
  const { value: token } = cookieStore.get('token') ?? { value: null };
  if (token) {
    const verifiedToken = await verifyJwtToken(token);
    return verifiedToken;
  } else {
    return null;
  }
};

export function useAuth() {
  const [auth, setAuth] = React.useState<JWTPayload | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const getVerifiedToken = async () => {
    const cookies = new Cookies();
    const token = cookies.get('token') ?? null;
    const verifiedToken: JWTPayload | null = await verifyJwtToken(token);
    setAuth(verifiedToken);
    setIsLoading(false);
  };

  React.useEffect(() => {
    getVerifiedToken();
  }, []);

  return { auth, isLoading };
}

useAuth.fromServer = useAuthFromServer;
