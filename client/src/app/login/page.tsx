/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RiAtLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { Loader } from '@/src/components/loader';
import { toast } from 'react-hot-toast';
import * as Yup from 'yup';

import LoginGuard from '@/src/guards/login/login.guard';
import GeneralCountdown from '@/src/components/countdown/general.countdown';
import { useFormik } from 'formik';
import Link from 'next/link';

export default function Login() {
  const params = useSearchParams();
  const guard = new LoginGuard();

  const passwordInput = useRef<HTMLInputElement>(null);
  const [passwordInputType, setPasswordInputType] = useState<'text' | 'password'>('password');
  const [guardLoad, setGuardLoad] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [leftBlockedSeconds, setLeftBlockedSeconds] = useState<number>(0);
  const [leftEntryRights, setLeftEntryRights] = useState(guard.states.request.limit);
  const schema = Yup.object().shape({
    email: Yup.string().required('Email is a required field').email(),
    password: Yup.string()
      .required('Password is a required field')
      .min(9, 'Password must be at least 9 characters')
      .max(32, 'Password must be at most 32 characters'),
  });
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },

    // Pass the Yup schema to validate the form
    validationSchema: schema,

    // Handle form submission
    onSubmit: async ({ email, password }) => {
      setIsLoading(true);

      if (typeof email !== 'undefined' && typeof password !== 'undefined') {
        const response = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
          .then((res) => res.json())
          .catch((error) => console.log(error));
        if (response.success) {
          const nextUrl = params?.get('next');
          await guard.refreshCookie();
          window.location.href = nextUrl || '/matchmaker';
        } else {
          //? Guard
          const isAvailableRequest = await guard.checkAvailabilty();
          if (!isAvailableRequest) {
            setIsBlocked(true);
            setLeftBlockedSeconds(guard.getLeftBanSeconds());
            return;
          }
          setLeftEntryRights(await guard.getHaveEntryRights());
          setIsLoading(false);
          toast.error(response.message);
        }
      }
    },
  });
  const { errors, touched, values, handleChange, handleSubmit } = formik;

  const checkGuard = useCallback(async () => {
    const rights = await guard.checkHaveEntryRights();

    if (!rights) {
      setIsBlocked(true);
      setLeftBlockedSeconds(guard.getLeftBanSeconds());
    }

    setGuardLoad(false);
  }, []);

  useEffect(() => {
    checkGuard();
  }, []);

  const blockCountdownEnded = async () => {
    await guard.refreshCookie();
    setIsLoading(false);
    setIsBlocked(false);
    setLeftBlockedSeconds(0);
    setLeftEntryRights(guard.states.request.limit);
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">The step before going to war!</h1>

        <p className="mt-4 text-gray-500">
          By logging in, you can match up with online users and start a competitive battle. You can improve your
          keyboard skills and dominate your opponents.
        </p>
      </div>

      {!isBlocked && !guardLoad && (
        <form onSubmit={handleSubmit} className="relative">
          <div className="mx-auto mb-0 mt-8 max-w-md space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  className={`${
                    errors.email && touched.email ? 'border border-red-500 placeholder-red-500' : ''
                  } w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm`}
                  placeholder="Enter email"
                  value={values.email}
                  onChange={handleChange}
                />

                <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                  <RiAtLine
                    className={`${errors.email && touched.email ? 'text-red-500' : ''} h-4 w-4 text-gray-400`}
                  />
                </span>
              </div>
              {errors.email && touched.email && <span className="text-sm text-red-500">{errors.email}</span>}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>

              <div className="relative">
                <input
                  type="password"
                  name="password"
                  ref={passwordInput}
                  className={`${
                    errors.password && touched.password ? 'border border-red-500 placeholder-red-500' : ''
                  } w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm`}
                  placeholder="Enter password"
                  value={values.password}
                  onChange={handleChange}
                />

                <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                  {passwordInputType === 'password' ? (
                    <RiEyeLine
                      className={`${
                        errors.password && touched.password ? 'text-red-500' : ''
                      } h-4 w-4 text-gray-400 cursor-pointer`}
                      onClick={() => {
                        if (passwordInput.current) {
                          passwordInput.current.type = 'text';
                          setPasswordInputType('text');
                        }
                      }}
                    />
                  ) : (
                    <RiEyeOffLine
                      className={`${
                        errors.password && touched.password ? 'text-red-500' : ''
                      } h-4 w-4 text-gray-400 cursor-pointer`}
                      onClick={() => {
                        if (passwordInput.current) {
                          passwordInput.current.type = 'password';
                          setPasswordInputType('password');
                        }
                      }}
                    />
                  )}
                </span>
              </div>
              {errors.password && touched.password && <span className="text-sm text-red-500">{errors.password}</span>}
            </div>

            {leftEntryRights < guard.states.request.limit && (
              <div>
                <span className="text-md text-error">
                  For security reasons, you are allowed
                  <span className="pl-1">{leftEntryRights}</span> logins. If you continue to log in incorrectly, you
                  will not be able to log in for {guard.states.request.banMinute} minutes.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  <Link href="/signup" className="underline">
                    Sign up
                  </Link>
                </p>
                <p className="text-sm text-gray-500">
                  <Link href="/forgot-password" className="underline">
                    Recover Password
                  </Link>
                </p>
              </div>

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
      )}

      {isBlocked && !guardLoad && (
        <div className="my-3 text-center">
          <span className="text-error">
            Too many incorrect logins. Please try logging in again after the time expires.
          </span>
          <GeneralCountdown seconds={leftBlockedSeconds} onCountdownEnded={blockCountdownEnded} />
        </div>
      )}

      {guardLoad && (
        <div className="my-3 text-center">
          <div className="loading loading-lg"></div>
        </div>
      )}
    </div>
  );
}
