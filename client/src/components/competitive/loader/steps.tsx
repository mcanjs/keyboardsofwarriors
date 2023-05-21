import { FaSortAlphaDown, FaUser } from 'react-icons/fa';

interface IProps {
  step: number;
}

export default function CompetitiveLoaderSteps(props: IProps) {
  const { step } = props;
  return (
    <div>
      <h2 className="sr-only">Steps</h2>

      <div>
        <ol className="grid grid-cols-1 divide-x divide-gray-100 overflow-hidden rounded-lg border border-gray-100 text-sm text-gray-500 sm:grid-cols-2">
          <li className={`${step > 1 ? 'bg-green-400' : 'bg-yellow-400'} flex items-center justify-center gap-2 p-4`}>
            <FaUser />

            <p className="leading-none">
              <strong className="block font-medium"> Opponent </strong>
              <small className="mt-1"> {step > 1 ? 'Ready' : 'Waiting'} </small>
            </p>
          </li>

          <li
            className={`${
              step > 2 ? 'bg-green-400' : step === 2 ? 'bg-yellow-400' : 'bg-gray-100'
            } flex items-center justify-center gap-2 p-4`}
          >
            <span className="absolute -left-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 rotate-45 border border-gray-100 ltr:border-b-0 ltr:border-s-0 ltr:bg-white rtl:border-e-0 rtl:border-t-0 rtl:bg-gray-50 sm:block"></span>

            <FaSortAlphaDown />

            <p className="leading-none">
              <strong className="block font-medium"> Words </strong>
              <small className="mt-1"> {step > 2 ? 'Ready' : 'Waiting'} </small>
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
}
