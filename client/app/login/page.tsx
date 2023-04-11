import { getServerSession } from 'next-auth';
import React from 'react';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { useUser } from '../hooks/user';

export default async function Login() {
  const session = await getServerSession(authOptions);
  return (
    <div>
      <h2>Server Session!</h2>
      <pre>{JSON.stringify(session)}</pre>
    </div>
  );
}
