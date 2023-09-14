import LottiePlayer from "lottie-react";
import { useState } from "react";
import UserWaiting from "@/src/json/animations/user-waiting.json";

export default function CompetitiveGameLoadScreen() {
  const [isUserWaiting] = useState<boolean>(true);
  return (
    <>
      {isUserWaiting && <LottiePlayer autoplay animationData={UserWaiting} />}
    </>
  );
}
