import { Loader } from '@/src/components/loader';
import { useState } from 'react';

export default function CustomGameLoadingScreen() {
  const [procedure, setProcedure] = useState<1 | 2 | 3>(3);
  const waitingProcedures = () => {
    if (procedure === 1) {
      return <div>Game loading....</div>;
    } else if (procedure === 2) {
      return <div>Opponent waiting....</div>;
    } else if (procedure === 3) {
      return <div>Game starting...</div>;
    }
  };
  return (
    <div className="w-full h-full absolute">
      <div className="w-full h-full flex flex-col justify-center items-center gap-4">
        <Loader className="loading-lg" />
        {waitingProcedures()}
      </div>
    </div>
  );
}
