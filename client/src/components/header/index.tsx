'use client';

import React from 'react';
import { useAuth } from '@/src/hooks/authentication/useAuth';
import { RiLoginBoxLine, RiLogoutBoxRLine, RiNotification2Line } from 'react-icons/ri';
import { Loader } from '../loader';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'universal-cookie';

export function Header() {
  const { auth, isLoading } = useAuth();

  const logout = () => {
    const cookies = new Cookies();
    cookies.remove('token');
    window.location.href = '/';
  };
  return (
    <header aria-label="Page Header" className="bg-gray-50">
      <div className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center sm:justify-between sm:gap-4">
          <div className="relative hidden sm:block">
            <Link href="/" className="block w-[164px] h-[72px]">
              <Image src="/logo.png" fill alt="" />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-between gap-8 sm:justify-end">
            <div className="flex gap-4">
              <button
                type="button"
                className="block shrink-0 rounded-lg bg-white p-2.5 text-gray-600 shadow-sm hover:text-gray-700 sm:hidden"
              >
                <span className="sr-only">Search</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {auth !== null && (
                <Link
                  href="/matchmaking"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-500 transition hover:text-gray-700 focus:outline-none focus:ring"
                  type="button"
                >
                  <span className="text-sm font-medium">Matchmaking</span>
                </Link>
              )}

              <button
                type="button"
                className="block shrink-0 rounded-lg bg-white p-2.5 text-gray-600 shadow-sm hover:text-gray-700"
              >
                <span className="sr-only">Notifications</span>
                <RiNotification2Line />
              </button>
              {isLoading && (
                <div className="flex items-center shrink-0 rounded-lg bg-white p-2.5 text-gray-600 shadow-sm hover:text-gray-700">
                  <Loader className="!w-[16px] !h-[16px]" />
                </div>
              )}
              {!isLoading && auth !== null && (
                <button
                  onClick={logout}
                  className="flex items-center shrink-0 rounded-lg bg-white p-2.5 text-gray-600 shadow-sm hover:text-gray-700"
                >
                  <RiLogoutBoxRLine />
                </button>
              )}
              {!isLoading && auth === null && (
                <Link
                  href="/login"
                  className="flex items-center shrink-0 rounded-lg bg-white p-2.5 text-gray-600 shadow-sm hover:text-gray-700"
                >
                  <RiLoginBoxLine />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
