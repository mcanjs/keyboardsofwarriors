import Link from 'next/link';
import { FaArrowLeft, FaTimesCircle } from 'react-icons/fa';

export default function CustomRoomFullyScreen() {
  return (
    <div className="flex flex-col flex-1 justify-center items-center">
      <FaTimesCircle size={30} className="text-red-500" />
      <div className="text-center">
        <p className="py-3 text-lg text-red-400">The room is full, please try entering another room.</p>
        <Link href="/custom" className="btn btn-primary">
          <FaArrowLeft size={20} />
          <span>Back</span>
        </Link>
      </div>
    </div>
  );
}
