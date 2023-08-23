'use client';

import { Loader } from '@/src/components/loader';
import { User } from '@prisma/client';
import { useFormik } from 'formik';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiAtLine } from 'react-icons/ri';
import * as Yup from 'yup';

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const schema = Yup.object().shape({
    email: Yup.string().required('Email is a required field').email(),
  });
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: schema,
    onSubmit: async ({ email }, { resetForm }) => {
      setIsLoading(true);

      if (typeof email !== 'undefined') {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/forgot-password`, {
          method: 'POST',
          body: JSON.stringify({ email }),
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(async (res) => {
          const response = await res.json();
          if (res.status !== 200) {
            setIsLoading(false);
            toast.error(response.message);
          } else {
            setIsLoading(false);
            toast.success(response.message);
          }

          resetForm();
        });
      }
    },
  });
  const { errors, touched, values, handleChange, handleSubmit } = formik;

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Recovery Password</h1>
        <p className="mt-4 text-gray-500">
          You will receive an e-mail after you write the e-mail address you used in the field below, click on the link
          in the e-mail and set your new password.
        </p>
      </div>
      <form onSubmit={handleSubmit} className={`${isLoading ? 'pointer-events-none' : ''} relative`}>
        <div className="mx-auto mb-0 mt-8 max-w-md space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">
              Email
            </label>

            <div className="relative">
              <input
                type="text"
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
                  className={`${
                    errors.email && touched.email ? 'text-red-500' : ''
                  } h-4 w-4 text-gray-400 cursor-pointer`}
                />
              </span>
            </div>
            {errors.email && touched.email && <span className="text-sm text-red-500">{errors.email}</span>}
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="inline-block rounded-lg bg-blue-500 px-5 py-3 text-sm font-medium text-white"
            >
              Recovery Password
            </button>
          </div>
        </div>
        {isLoading && (
          <div className="max-w-md w-full h-full absolute top-0 left-1/2 flex justify-center items-center -translate-x-1/2 bg-white">
            <Loader />
          </div>
        )}
      </form>
    </div>
  );
}
