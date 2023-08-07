import ResultLottieScreen from "@/src/components/screens/result/lottie.screen";
import { PageProps } from "@/.next/types/app/layout";
import { prisma } from "@/src/libs/prisma";
import { useAuth } from "@/src/hooks/authentication/useAuth";
import ResultTextScreen from "@/src/components/screens/result/text.screen";
import Link from "next/link";

async function getData(matchId: string) {
  const isValid = new RegExp("^[0-9a-fA-F]{24}$").test(matchId);

  if (isValid) {
    return await prisma.matches.findUnique({
      where: {
        id: matchId,
      },
    });
  }
  return null;
}

export default async function ResultPage(pageProps: PageProps) {
  const auth = (await useAuth.fromServer()) ?? null;
  const data = await getData(pageProps.params.id);

  return (
    <div className="max-w-lg flex-1 relative flex items-center justify-center mx-auto my-5">
      <div className="mx-auto max-w-xl text-center">
        {data !== null ? (
          <>
            <ResultLottieScreen data={data} userId={auth?.id as string} />
            <ResultTextScreen data={data} userId={auth?.id as string} />
          </>
        ) : (
          <div className="flex flex-col justify-center">
            <p className="text-[32px] text-red-500 font-bold">
              Match Not Found
            </p>
            <small>
              The match you searched for was not found, please make sure you
              have entered the correct match information.
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
