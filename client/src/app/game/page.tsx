import CompetitiveGameScreen from '@/src/components/game/screen/competitive.screen';

export default function Game() {
  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center">
      <div className="max-w-xl min-w-lg w-full rounded bg-base-200">
        <CompetitiveGameScreen />
      </div>
    </div>
  );
}
