import ResultLottieScreen from '@/src/components/screens/result/animation.screen';

import { prisma } from '@/src/libs/prisma';
import { useAuth } from '@/src/hooks/authentication/useAuth';
import ResultSummaryScreen from '@/src/components/screens/result/summary.screen';
import { JWTPayload } from 'jose';
import { PageProps } from '@/.next/types/app/layout';
import ResultDetailScreen from '@/src/components/screens/result/detail.screen';
import { Matches } from '@prisma/client';

async function getData(matchId: string, auth: JWTPayload | null) {
  const isValid = new RegExp('^[0-9a-fA-F]{24}$').test(matchId);
  const userId = auth?.id as string;
  if (isValid) {
    const match = await prisma.matches.findUnique({
      where: {
        id: matchId,
      },
    });

    if (match?.users.includes(userId)) return match;

    return null;
  }
  return null;
}

async function getUsers(data: Matches | null) {
  if (data) {
    const users = await prisma.user.findMany({
      where: {
        id: { in: data.users },
      },
    });

    return users;
  }

  return null;
}

export default async function ResultPage(pageProps: PageProps) {
  const auth = (await useAuth.fromServer()) ?? null;
  const data = await getData(pageProps.params.id, auth);
  const users = await getUsers(data);

  return (
    <div className="container mx-auto">
      {data !== null ? (
        <div>
          <div className="flex flex-col items-center mt-3 pb-3 border-b border-b-gray-600 md:flex-row md:items-start">
            {/* <ResultLottieScreen data={data} userId={auth?.id as string} /> */}
            <ResultSummaryScreen data={data} userId={auth?.id as string} />
          </div>
          <div>
            <ResultDetailScreen data={data} userId={auth?.id as string} users={users} auth={auth} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center">
          <p className="text-[32px] text-red-500 font-bold">Match Not Found</p>
          <small>
            The match you searched for was not found, please make sure you have entered the correct match information.
          </small>
        </div>
      )}
    </div>
  );
}
