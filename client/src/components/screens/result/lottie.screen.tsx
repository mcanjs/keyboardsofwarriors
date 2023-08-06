"use client";

import Lottie from "lottie-react";
import winnerBadge from "@/src/json/animations/winner-badge.json";
import drawBadge from "@/src/json/animations/hand-in-hand.json";
import loserBadge from "@/src/json/animations/loser-badge.json";
import disconnected from "@/src/json/animations/question-mark.json";
import { Matches } from "@prisma/client";

interface IProps {
  data: Matches | null;
  userId: string | null;
}

export default function ResultLottieScreen({ data, userId }: IProps) {
  return (
    <>
      {data?.winnerId === userId ? (
        <Lottie
          animationData={winnerBadge}
          loop={true}
          className="w-[250px] h-[250px] mx-auto"
        />
      ) : data?.loserId === userId ? (
        <Lottie
          animationData={loserBadge}
          loop={true}
          className="w-[250px] h-[250px] mx-auto"
        />
      ) : data?.winnerId === "" && data?.loserId === "" ? (
        <Lottie
          animationData={drawBadge}
          loop={true}
          className="w-[250px] h-[250px] mx-auto"
        />
      ) : (
        <Lottie
          animationData={disconnected}
          loop={true}
          className="w-[250px] h-[250px] mx-auto"
        />
      )}
    </>
  );
}
