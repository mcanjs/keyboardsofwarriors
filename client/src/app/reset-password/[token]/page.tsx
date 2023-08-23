'use client';

import { Loader } from '@/src/components/loader';
import { User } from '@prisma/client';
import { useFormik } from 'formik';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiEyeLine } from 'react-icons/ri';
import * as Yup from 'yup';

export default function ResetPassword() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<User | undefined>(undefined);

  const tokenVerify = useCallback(async () => {
    const data = await fetch(`/api/reset-password/${params.token}`).then((res) => res.json());
    if (!data.user) {
      window.location.href = '/';
    } else {
      setData(data.user);
    }
  }, [params]);

  useEffect(() => {
    tokenVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const passwordInput = useRef<HTMLInputElement>(null);
  const repeatPasswordInput = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const schema = Yup.object().shape({
    password: Yup.string()
      .required('Password is a required field')
      .min(9, 'Password must be at least 9 characters')
      .max(32, 'Password must be at most 32 characters'),
    repeatPassword: Yup.string()
      .required('Please retype your password.')
      .oneOf([Yup.ref('password')], 'Your passwords do not match.'),
  });
  const formik = useFormik({
    initialValues: {
      password: '',
      repeatPassword: '',
    },
    validationSchema: schema,
    onSubmit: async ({ password, repeatPassword }) => {
      setIsLoading(true);

      if (typeof password !== 'undefined' && typeof repeatPassword !== 'undefined' && password === repeatPassword) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/reset-password`, {
          method: 'POST',
          body: JSON.stringify({ userId: data?.id, passwordResetToken: params.token, password }),
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(async (res) => {
          const response = await res.json();
          if (res.status !== 200) {
            setIsLoading(false);
            toast.error(response.message);
          } else {
            toast.success(response.message);
            router.push('/login');
          }
        });
      } else {
        toast.error("Passwords don't match");
      }
    },
  });
  const { errors, touched, values, handleChange, handleSubmit } = formik;

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      {typeof data === 'undefined' ? (
        <div className="text-center">
          <Loader className="mx-auto loading-lg" />
        </div>
      ) : (
        <>
          <div className="mx-auto max-w-lg text-center">
            <h1 className="text-2xl font-bold sm:text-3xl">Change Password</h1>
          </div>
          <form onSubmit={handleSubmit} className="relative">
            <div className="mx-auto mb-0 mt-8 max-w-md space-y-4">
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
                    <RiEyeLine
                      className={`${
                        errors.password && touched.password ? 'text-red-500' : ''
                      } h-4 w-4 text-gray-400 cursor-pointer`}
                      onClick={() => {
                        if (passwordInput.current) {
                          if (passwordInput.current.type === 'text') {
                            passwordInput.current.type = 'password';
                          } else {
                            passwordInput.current.type = 'text';
                          }
                        }
                      }}
                    />
                  </span>
                </div>
                {errors.password && touched.password && <span className="text-sm text-red-500">{errors.password}</span>}
              </div>

              <div>
                <label htmlFor="repeatPassword" className="sr-only">
                  Re-Password
                </label>

                <div className="relative">
                  <input
                    type="password"
                    name="repeatPassword"
                    ref={repeatPasswordInput}
                    className={`${
                      errors.repeatPassword && touched.repeatPassword ? 'border border-red-500 placeholder-red-500' : ''
                    } w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm`}
                    placeholder="Enter re-password"
                    value={values.repeatPassword}
                    onChange={handleChange}
                  />

                  <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                    <RiEyeLine
                      className={`${
                        errors.repeatPassword && touched.repeatPassword ? 'text-red-500' : ''
                      } h-4 w-4 text-gray-400 cursor-pointer`}
                      onClick={() => {
                        if (repeatPasswordInput.current) {
                          if (repeatPasswordInput.current.type === 'text') {
                            repeatPasswordInput.current.type = 'password';
                          } else {
                            repeatPasswordInput.current.type = 'text';
                          }
                        }
                      }}
                    />
                  </span>
                </div>
                {errors.repeatPassword && touched.repeatPassword && (
                  <span className="text-sm text-red-500">{errors.repeatPassword}</span>
                )}
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="inline-block rounded-lg bg-blue-500 px-5 py-3 text-sm font-medium text-white"
                >
                  Change Password
                </button>
              </div>
            </div>
            {isLoading && (
              <div className="max-w-md w-full h-full absolute top-0 left-1/2 flex justify-center items-center -translate-x-1/2 bg-white">
                <Loader />
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}
