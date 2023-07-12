"use client";
import CompetitiveGameScreen from "./game.screen";
import CompetitiveGameLoadScreen from "./gameload.screen";
import { useState } from "react";

export default function Game() {
  const [isGameLoading, setIsGameLoading] = useState<boolean>(false);
  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center">
      <div className="max-w-xl min-w-lg w-full rounded bg-base-200">
        {isGameLoading ? (
          <div className="max-w-lg mx-auto">
            <CompetitiveGameLoadScreen />
            <p className="p-3 text-center">Opponent is waiting</p>
          </div>
        ) : (
          <CompetitiveGameScreen />
        )}
      </div>
    </div>
  );
}
