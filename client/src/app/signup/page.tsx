'use client';

import { Loader } from '@/src/components/loader';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiAtLine, RiEyeLine, RiUser2Line } from 'react-icons/ri';
import * as Yup from 'yup';

export default function Signup() {
  const params = useSearchParams();
  const passwordInput = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const schema = Yup.object().shape({
    email: Yup.string().required('Email is a required field').email(),
    username: Yup.string()
      .required('Username is a required field')
      .matches(
        /^[A-Za-z ]*$/,
        'You can only use alphabetical letters in the username field. Numbers or special symbols cannot be used.'
      )
      .min(6, 'Username must be at least 6 characters')
      .max(12, 'Username must be at most 12 characters'),
    password: Yup.string()
      .required('Password is a required field')
      .min(9, 'Password must be at least 9 characters')
      .max(32, 'Password must be at most 32 characters'),
  });
  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      password: '',
    },

    // Pass the Yup schema to validate the form
    validationSchema: schema,

    // Handle form submission
    onSubmit: async ({ email, username, password }) => {
      setIsLoading(true);

      if (typeof email !== 'undefined' && typeof password !== 'undefined') {
        const response = await fetch('/api/signup', {
          method: 'POST',
          body: JSON.stringify({ email, username, password }),
        })
          .then((res) => res.json())
          .catch((error) => console.log(error));
        if (response.success) {
          const nextUrl = params?.get('next');
          window.location.href = nextUrl || '/';
        } else {
          setIsLoading(false);
          toast.error(response.message);
        }
      }
    },
  });
  const { errors, touched, values, handleChange, handleSubmit } = formik;

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Sign Up</h1>
        <p className="mt-4 text-gray-500">
          By signing up, you can connect with other online users and engage in competitive battles. Enhance your
          keyboard skills and conquer your adversaries as you embark on a journey of improvement and victory.
        </p>
      </div>
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
                <RiAtLine className={`${errors.email && touched.email ? 'text-red-500' : ''} h-4 w-4 text-gray-400`} />
              </span>
            </div>
            {errors.email && touched.email && <span className="text-sm text-red-500">{errors.email}</span>}
          </div>
          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>

            <div className="relative">
              <input
                type="username"
                name="username"
                className={`${
                  errors.username && touched.username ? 'border border-red-500 placeholder-red-500' : ''
                } w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm`}
                placeholder="Enter username"
                value={values.username}
                onChange={handleChange}
              />

              <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                <RiUser2Line
                  className={`${errors.username && touched.username ? 'text-red-500' : ''} h-4 w-4 text-gray-400`}
                />
              </span>
            </div>
            {errors.username && touched.username && <span className="text-sm text-red-500">{errors.username}</span>}
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

          <div className="flex items-center justify-between">
            <div className="flex gap-1 items-center">
              <p className="text-sm text-gray-500">Already have account?</p>
              <span>
                <Link href="/login" className="underline">
                  Login
                </Link>
              </span>
            </div>

            <button
              type="submit"
              className="inline-block rounded-lg bg-blue-500 px-5 py-3 text-sm font-medium text-white"
            >
              Sign up
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
