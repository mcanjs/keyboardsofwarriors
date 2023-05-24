import CompetitiveLoaderAnimations from './animation';
import CompetitiveLoaderSteps from './steps';
if (typeof window !== 'undefined') import('@lottiefiles/lottie-player');

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
