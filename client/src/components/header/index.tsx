'use client';

import { useAuth } from '@/src/hooks/authentication/useAuth';
import Link from 'next/link';
import { Loader } from '../loader';
import { logout } from '@/src/utils/auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Header() {
  const { isLoading, auth } = useAuth();
  const router = useRouter();

  const onLogout = async () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const isLoggedOut = await logout();
    if (isLoggedOut) window.location.reload();
  };

  return (
    <div className="navbar w-full h-[80px] fixed top-0 left-0 z-[1] flex-wrap gap-1 p-0 bg-base-200 md:flex-nowrap md:flex-row ">
      <div className="container mx-auto">
        <div
          className={`flex flex-1 basis-1/6 justify-center ${
            !isLoading && auth ? 'md:basis-1/3' : 'md:basis-2/3'
          } md:justify-start p-3`}
        >
          <Link href="/" className="mr-auto text-sm">
            Keyboards of Warriors
          </Link>
        </div>
        <div className="flex-1 hidden md:flex md:basis-1/3 p-3">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="relative mx-auto overflow-hidden"
          >
            <Link href="/matchmaker" className="btn bg-indigo-600 hover:bg-indigo-500">
              PLAY
            </Link>
          </motion.div>
        </div>
        <div
          className={`flex flex-1 basis-1/6 ${
            !isLoading && auth ? 'md:basis-1/3' : 'md:basis-2/3 justify-center'
          } md:justify-end p-3`}
        >
          {isLoading && <Loader className="ml-auto loading-lg" />}
          {!isLoading && auth && (
            <div className="dropdown dropdown-end ml-auto">
              <label tabIndex={0} className="avatar placeholder cursor-pointer">
                <div className="bg-base-300 rounded-full w-[40px] h-[40px]">
                  <span>{(auth.email as string).charAt(0).toLocaleUpperCase()}</span>
                </div>
              </label>
              <ul tabIndex={0} className="menu dropdown-content p-2 shadow bg-base-200 rounded-box w-52 mt-4">
                <li>
                  <Link href="/profile">Profile</Link>
                </li>
                <li>
                  <button onClick={onLogout}>Logout</button>
                </li>
              </ul>
            </div>
          )}
          {!isLoading && !auth && (
            <ul className="menu menu-horizontal">
              <li>
                <Link href="/login">Login</Link>
              </li>
              <li>
                <Link href="/signup">Signup</Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
