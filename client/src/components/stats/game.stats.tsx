import { FaRegCheckCircle, FaRegTimesCircle, FaUserCheck } from 'react-icons/fa';

interface IProps {
  correct: number;
  incorrect: number;
}

export default function CompetitiveStat(props: IProps) {
  const { correct, incorrect } = props;
  return (
    <div className="w-full flex flex-wrap justify-between p-5">
      <div className="basis-1/3">
        <div className="stat-figure mr-auto text-green-700">
          <FaRegCheckCircle className="inline-block w-8 h-8 stroke-current" />
        </div>
        <div className="stat-title text-green-700">Total Corrects</div>
        <div className="stat-value text-green-700">{correct}</div>
      </div>

      <div className="basis-1/3">
        <div className="stat-figure text-red-700">
          <FaRegTimesCircle className="inline-block w-8 h-8 stroke-current" />
        </div>
        <div className="stat-title text-red-700">Total Incorrects</div>
        <div className="stat-value text-red-700">{incorrect}</div>
      </div>
      <div className="basis-1/3">
        <div className="stat-figure text-gray-700">
          <FaUserCheck className="inline-block w-8 h-8 stroke-current" />
        </div>
        <div className="stat-title text-gray-700">Opponent Corrects</div>
        <div className="stat-value text-gray-700">0</div>
      </div>
    </div>
  );
}
