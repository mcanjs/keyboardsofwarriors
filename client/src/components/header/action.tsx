'use client';

import { logout } from '@/src/utils/auth';

export default function HeaderAction() {
  const onLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return <button onClick={onLogout}>Logout</button>;
}
