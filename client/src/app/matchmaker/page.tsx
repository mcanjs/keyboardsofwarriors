import { useAuth } from '@/src/hooks/authentication/useAuth';
import { prisma } from '@/src/libs/prisma';
import { capitalizeFirstLetter } from '@/src/utils/helper';
import MMR from '@/src/utils/mmr';
import Link from 'next/link';
import { IoArrowForwardOutline } from 'react-icons/io5';

async function getUserData() {
  const authedUser = await useAuth.fromServer();
  const user = await prisma.user.findUnique({
    where: {
      //@ts-ignore
      email: authedUser.email,
    },
  });

  return user;
}

export default async function Matchmaker() {
  const data = await getUserData();
  return data ? (
    <div className="flex-1 h-full flex flex-row flex-wrap container mx-auto gap-4 md:flex-nowrap">
      <Link href="/competitive" className="flex basis-full md:basis-1/3 p-3">
        <div className="w-full group flex flex-col justify-between rounded-sm bg-base-300 p-4 shadow-xl transition-shadow hover:shadow-lg sm:p-6 lg:p-8">
          <div className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-3xl font-bold text-indigo-600 sm:text-5xl">Competitive</h3>
              <div className="mt-4 border-t-2 border-gray-100 pt-4">
                <p className="text-lg font-bold text-gray-500">Fight and show your keyboard skills.</p>
                <ul className="list-disc mt-3 pl-[15px] text-sm text-gray-500">
                  <li>Earn rank point</li>
                  <li>League upgrade</li>
                </ul>
              </div>
            </div>

            <div className="pt-4">
              <p>Current rank : {capitalizeFirstLetter(MMR.generateMmrToString(data.rank))}</p>
            </div>
          </div>

          <div className="mt-3 inline-flex items-center gap-2 text-indigo-600">
            <p className="font-medium sm:text-lg">PLAY</p>

            <IoArrowForwardOutline className="w-6 h-6 transition-all group-hover:ms-3 rtl:rotate-180" />
          </div>
        </div>
      </Link>
      <div className="flex basis-full md:basis-1/3 p-3">
        <Link
          href="/improve"
          className="w-full group flex flex-col justify-between rounded-sm bg-base-300 p-4 shadow-xl transition-shadow hover:shadow-lg sm:p-6 lg:p-8"
        >
          <div>
            <h3 className="text-3xl font-bold text-indigo-600 sm:text-5xl">Improve Yourself</h3>

            <div className="mt-4 border-t-2 border-gray-100 pt-4">
              <p className="text-lg font-bold text-gray-500">Play with your friends without ranking difference</p>
            </div>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 text-indigo-600 sm:mt-12 lg:mt-16">
            <p className="font-medium sm:text-lg">PLAY</p>

            <IoArrowForwardOutline className="w-6 h-6 transition-all group-hover:ms-3 rtl:rotate-180" />
          </div>
        </Link>
      </div>
      <div className="flex basis-full md:basis-1/3 p-3">
        <div className="w-full group flex flex-col rounded-sm bg-base-300 p-4 shadow-xl transition-shadow hover:shadow-lg sm:p-6 lg:p-8">
          <div>
            <h3 className="text-3xl font-bold text-indigo-600 sm:text-5xl">Private Rooms</h3>
          </div>
          <div className="h-full flex justify-center items-center mt-4 border-t-2 border-gray-100 pt-4">
            <p className="text-lg font-bold text-gray-500">COMING SOON!</p>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
