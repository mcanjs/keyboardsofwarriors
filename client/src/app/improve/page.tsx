import GeneralGameScreen from '@/src/components/screens/general/game/game.screen';
import { generateWord } from '@/src/utils/helper';

function getWords(): string[] {
  const words = generateWord('en', 350);
  return words;
}

export default async function ImprovePage() {
  const words = getWords();
  return (
    <div className="container mx-auto h-[calc(100vh-160px)]">
      <div className="w-full h-full flex items-center">
        <GeneralGameScreen words={words} />
      </div>
    </div>
  );
}
