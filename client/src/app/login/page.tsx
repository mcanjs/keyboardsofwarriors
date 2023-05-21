'use client';

import React, { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RiAtLine, RiEyeLine } from 'react-icons/ri';
import { Loader } from '@/src/components/loader';
import { toast } from 'react-hot-toast';

export default function Login() {
  const params = useSearchParams();
  const [email, setEmail] = useState<undefined | string>(undefined);
  const [password, setPassword] = useState<undefined | string>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (event: FormEvent): Promise<void> => {
    setIsLoading(true);
    event.preventDefault();
    if (typeof email !== 'undefined' && typeof password !== 'undefined') {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }).then((res) => res.json());
      if (response.success) {
        const nextUrl = params?.get('next');
        window.location.href = nextUrl || '/';
      } else {
        setIsLoading(false);
        toast.error(response.message);
      }
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Get started today!</h1>

        <p className="mt-4 text-gray-500">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Et libero nulla eaque error neque ipsa culpa autem,
          at itaque nostrum!
        </p>
      </div>

      <form onSubmit={onSubmit} className="relative ">
        <div className="mx-auto mb-0 mt-8 max-w-md space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>

            <div className="relative">
              <input
                type="email"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Enter email"
                onChange={(e) => setEmail(e.currentTarget.value)}
              />

              <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                <RiAtLine className="h-4 w-4 text-gray-400" />
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>

            <div className="relative">
              <input
                type="password"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Enter password"
                onChange={(e) => setPassword(e.currentTarget.value)}
              />

              <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                <RiEyeLine className="h-4 w-4 text-gray-400" />
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              No account?
              <a className="underline" href="">
                Sign up
              </a>
            </p>

            <button
              type="submit"
              className="inline-block rounded-lg bg-blue-500 px-5 py-3 text-sm font-medium text-white"
            >
              Sign in
            </button>
          </div>
        </div>
        {isLoading && (
          <div className="w-full h-full absolute top-0 left-0 flex justify-center items-center bg-white">
            <Loader />
          </div>
        )}
      </form>
    </div>
  );
}
