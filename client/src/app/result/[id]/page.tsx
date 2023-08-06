import ResultLottieScreen from "@/src/components/screens/result/lottie.screen";
import { PageProps } from "@/.next/types/app/layout";
import { prisma } from "@/src/libs/prisma";
import { useAuth } from "@/src/hooks/authentication/useAuth";
import ResultTextScreen from "@/src/components/screens/result/text.screen";

async function getData(matchId: string) {
  return await prisma.matches.findUnique({
    where: {
      id: matchId,
    },
  });
}

export default async function ResultPage(pageProps: PageProps) {
  const auth = (await useAuth.fromServer()) ?? null;
  const data = await getData(pageProps.params.id);

  return (
    <div className="max-w-lg relative flex items-center justify-center mx-auto my-5">
      <div className="mx-auto max-w-xl text-center">
        <ResultLottieScreen data={data} userId={auth?.id as string} />
        <ResultTextScreen data={data} userId={auth?.id as string} />
      </div>
    </div>
  );
}
