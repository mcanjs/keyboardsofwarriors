import CompetitiveLoaderAnimations from './animation';
import CompetitiveLoaderSteps from './steps';
import '@lottiefiles/lottie-player';

interface IProps {
  step: number;
}

export default function CompetitiveLoader(props: IProps) {
  const { step } = props;

  return (
    <div className="words-loader flex flex-col items-center">
      <CompetitiveLoaderSteps step={step} />
      <CompetitiveLoaderAnimations step={step} />
    </div>
  );
}
