import ProfileMatchesScreen from '@/src/components/screens/profile/matches.screen';
import { useAuth } from '@/src/hooks/authentication/useAuth';
import { prisma } from '@/src/libs/prisma';
import { capitalizeFirstLetter } from '@/src/utils/helper';
import MMR from '@/src/utils/mmr';
import Link from 'next/link';
import { GiRank1, GiTrophyCup } from 'react-icons/gi';


async function userStatus(banned: Date | undefined) {
  if (banned) {
    console.log('banned date:', new Date(banned).toLocaleString());
    console.log('now date:', new Date().toLocaleString());
    if (new Date(banned) > new Date()) {
      return false;
    }
    return true;
  }
  return true;
}

export default async function Profile() {
  const authedUser = await useAuth.fromServer();
  return authedUser ? (
    <div className="min-h-full flex flex-col flex-1 gap-5 container my-3 mx-auto md:flex-row">
      <div className="w-full flex-1 self-stretch basis-1/3 rounded p-4 bg-base-200">
        <div className="flex flex-col items-center border-b border-b-slate-700 pb-5">
          <label tabIndex={0} className="avatar placeholder">
            <div className="bg-base-300 rounded-full w-[80px] h-[80px]">
              <span className="text-[24px]">{(authedUser.email as string).charAt(0).toLocaleUpperCase()}</span>
            </div>
          </label>
          <div className="mt-3">
            <p className="text-[24px]">{authedUser.username}</p>
          </div>
          <div className="flex gap-5 mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center p-2 bg-base-100">
                <GiRank1 size={25} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs">League</span>
                <span className="text-sm">{capitalizeFirstLetter(MMR.generateMmrToString(authedUser.rank))}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center p-2 bg-base-100">
                <GiTrophyCup size={25} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs">Wins</span>
                <span className="text-sm">0</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-3 pt-5">
          <div className="flex gap-1 text-sm">
            <span>Username</span>
            <span>:</span>
            <span className="text-gray-500">{authedUser.username}</span>
          </div>
          <div className="flex gap-1 text-sm">
            <span>Status</span>
            <span>:</span>
            {true ? (
              <div className="badge badge-success gap-2 rounded-sm">Active</div>
            ) : (
              <div className="badge badge-error gap-2 rounded-sm">Banned</div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col flex-1 basis-2/3">
        <div>
          <p className="text-[32px] font-light">Last 5 Matches</p>
          <ProfileMatchesScreen user={authedUser} />
        </div>
        <Link href="/" className="btn btn-neutral mt-5">
          Show All Matches
        </Link>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
