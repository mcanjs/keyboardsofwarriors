import { useAuth } from '@/src/hooks/authentication/useAuth';
import Link from 'next/link';
import HeaderAction from './action';
import { GiCrossedSwords } from 'react-icons/gi';

export default async function Header() {
  const auth = await useAuth.fromServer();
  return (
    <header className="navbar w-full h-[80px] fixed top-0 left-0 z-[1] flex-wrap gap-1 p-0 bg-base-200 md:flex-nowrap md:flex-row ">
      <div className="container mx-auto">
        <div
          className={`flex flex-1 basis-1/2 justify-center items-center mr-auto p-3 ${
            auth ? 'md:basis-1/3' : 'md:basis-2/3'
          } md:justify-start`}
        >
          <GiCrossedSwords className="w-10 h-10 text-indigo-500" />
          <Link href="/" className="mr-2 text-xs md:text-sm">
            Keyboards of Warriors
          </Link>
          <span className="text-gray-600 font-light">BETA</span>
        </div>
        <div className="flex-1 flex basis-1/2 md:basis-1/3 p-3">
          <div className="relative ml-auto overflow-hidden md:mx-auto">
            <Link href="/matchmaker" className="btn bg-indigo-600 hover:bg-indigo-500">
              PLAY
            </Link>
          </div>
        </div>
        <div
          className={`flex-1 hidden md:flex ${
            auth ? 'md:basis-1/3' : 'md:basis-2/3 justify-center'
          } md:justify-end p-3`}
        >
          {auth && (
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
                  <HeaderAction />
                </li>
              </ul>
            </div>
          )}
          {!auth && (
            <ul className="menu menu-horizontal hidden md:flex">
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
    </header>
  );
}
