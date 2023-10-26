import React from 'react';
import Cookies from 'universal-cookie';
import { IUser } from '@/src/interfaces/user.interface';

const useAuthFromServer = async () => {
  const { cookies } = require('next/headers');
  const cookieStore = cookies();
  const { value: auth } = cookieStore.get('auth') ?? { value: null };

  return JSON.parse(auth);
};

export function useAuth() {
  const [auth, setAuth] = React.useState<IUser | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const getVerifiedToken = async () => {
    const cookies = new Cookies();
    const userAuth = cookies.get('auth') ?? null;
    setAuth(userAuth);
    setIsLoading(false);
  };

  React.useEffect(() => {
    getVerifiedToken();
  }, []);

  return { auth, isLoading };
}

useAuth.fromServer = useAuthFromServer;
