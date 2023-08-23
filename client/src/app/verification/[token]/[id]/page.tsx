/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Loader } from '@/src/components/loader';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiCheckboxCircleLine, RiCloseCircleLine } from 'react-icons/ri';

export default function Verification() {
  const router = useRouter();
  const { token, id } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const checkIsVerifiable = useCallback(async () => {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/verify-email`, {
      method: 'POST',
      body: JSON.stringify({ token, userId: id }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        const response = await res.json();
        setIsLoading(false);
        if (res.status !== 200) {
          toast.error(response.message);
          setIsVerified(false);
          router.push('/signup');
        } else {
          router.push('/login');
          toast.success(response.message + ' login right now');
          setIsVerified(true);
        }
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    checkIsVerifiable();
  }, []);

  return (
    <div className="container mx-auto">
      <div className="flex flex-col justisfy-center items-center gap-4">
        {isLoading ? (
          <Loader className="loading-lg" />
        ) : isVerified ? (
          <>
            <span className="text-green-600">
              <RiCheckboxCircleLine size={64} />
            </span>

            <div className="text-center">
              <strong className="block text-md font-bold md:text-[32px]">Verification Successful</strong>
              <p className="mt-1 text-sm text-gray-500 md:text-[20px]">Your account activated successfully</p>
            </div>
          </>
        ) : (
          <>
            <span className="text-red-600">
              <RiCloseCircleLine size={64} />
            </span>

            <div className="text-center">
              <strong className="block text-md font-bold md:text-[32px]">Verification Successful</strong>
              <p className="mt-1 text-sm text-gray-500 md:text-[20px]">Your account activated successfully</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
