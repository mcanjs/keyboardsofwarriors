interface IProps {
  step: number;
}

export default function CompetitiveLoaderAnimations(props: IProps) {
  const { step } = props;
  return (
    <>
      {step === 1 && (
        <lottie-player
          src="https://assets6.lottiefiles.com/datafiles/8yvoinR27PpzCUE/data.json"
          class="w-[250px] h-[250px]"
          background="transparent"
          speed="1"
          loop
          autoplay
        />
      )}
      {step === 2 && (
        <lottie-player
          src="https://assets7.lottiefiles.com/packages/lf20_tnrzlN.json"
          class="w-[250px] h-[250px]"
          background="transparent"
          speed="1"
          loop
          autoplay
        />
      )}
    </>
  );
}
