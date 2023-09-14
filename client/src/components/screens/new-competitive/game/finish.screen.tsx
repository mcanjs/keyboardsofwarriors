import Lottie from 'lottie-react';
import calculatingResults from '@/src/json/animations/calculating-result.json';

export default function CompetitiveGameFinished() {
  return (
    <div className="w-full h-full absolute top-0 left-0 flex flex-col justify-center items-center">
      <Lottie animationData={calculatingResults} className="w-[250px] mx-auto" />
      <p className="text-[36px] font-bold">Calculating results</p>
      <small>Please wait...</small>
      <small className="max-w-[250px] text-center">
        Once the results have been calculated, you will be automatically redirected to the results page
      </small>
    </div>
  );
}
