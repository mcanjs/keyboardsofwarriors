import Link from 'next/link';
import { FaArrowLeft, FaTimesCircle } from 'react-icons/fa';

export default function CustomRoomNotConnectedScreen() {
  return (
    <div className="flex flex-col flex-1 justify-center items-center">
      <FaTimesCircle size={30} className="text-red-500" />
      <div className="text-center">
        <p className="py-3 text-lg text-red-400">Room not found, please make sure you entered your room ID correctly</p>
        <Link href="/custom" className="btn btn-primary">
          <FaArrowLeft size={20} />
          <span>Back</span>
        </Link>
      </div>
    </div>
  );
}
