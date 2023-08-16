import { useAuth } from '@/src/hooks/authentication/useAuth';
import { prisma } from '@/src/libs/prisma';
import { capitalizeFirstLetter } from '@/src/utils/helper';
import MMR from '@/src/utils/mmr';
import { User } from '@prisma/client';
import { JWTPayload } from 'jose';
import { GiRank1, GiTrophyCup } from 'react-icons/gi';

async function getUserData(authedUser: JWTPayload | null) {
  const user = await prisma.user.findUnique({
    where: {
      //@ts-ignore
      email: authedUser.email,
    },
  });

  return user;
}

async function getUserMatches(authedUser: JWTPayload | null) {
  const matches = await prisma.matches.findMany({
    where: {
      //@ts-ignore
      users: { hasEvery: [authedUser.id] },
    },
  });

  const wins = await prisma.matches.findMany({
    where: {
      //@ts-ignore
      winnerId: authedUser.id,
    },
  });

  return { matches, wins };
}

async function userStatus(banned: Date | undefined) {
  if (banned) {
    if (new Date(banned).toLocaleString() > new Date().toLocaleString()) {
      return false;
    }
    return true;
  }
  return true;
}

export default async function Profile() {
  const authedUser = await useAuth.fromServer();
  const user = await getUserData(authedUser);
  const { matches, wins } = await getUserMatches(authedUser);
  const status = await userStatus(user?.banned);
  return user ? (
    <div className="flex-1 min-h-full container mx-auto">
      <div className="flex gap-5 mt-3">
        <div className="flex-1 basis-1/3 rounded p-4 bg-base-200">
          <div className="flex flex-col items-center border-b border-b-slate-700 pb-5">
            <label tabIndex={0} className="avatar placeholder">
              <div className="bg-base-300 rounded-full w-[80px] h-[80px]">
                <span className="text-[24px]">{(user?.email as string).charAt(0).toLocaleUpperCase()}</span>
              </div>
            </label>
            <div className="mt-3">
              <p className="text-[24px]">{user?.username}</p>
            </div>
            <div className="flex gap-5 mt-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center p-2 bg-base-100">
                  <GiRank1 size={25} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs">League</span>
                  <span className="text-sm">{capitalizeFirstLetter(MMR.generateMmrToString(user.rank))}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center p-2 bg-base-100">
                  <GiTrophyCup size={25} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs">Wins</span>
                  <span className="text-sm">{wins.length}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-y-3 pt-5">
            <div className="flex gap-1 text-sm">
              <span>Username</span>
              <span>:</span>
              <span className="text-gray-500">{user.username}</span>
            </div>
            <div className="flex gap-1 text-sm">
              <span>Status</span>
              <span>:</span>
              {status ? (
                <div className="badge badge-success gap-2 rounded-sm">Active</div>
              ) : (
                <div className="badge badge-error gap-2 rounded-sm">Banned</div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 basis-2/3">
          <p className="text-[32px] font-light">Matches</p>
          <div className="mt-5">
            {matches.length > 0 &&
              matches.map((match, index) => (
                <div
                  className={`${
                    matches.length - 1 !== index ? 'border-b border-b-slate-700' : ''
                  } bg-base-200 collapse collapse-arrow rounded-none`}
                >
                  <input type="checkbox" />
                  <div className="collapse-title text-md font-medium ">
                    <div className="flex justify-between items-center">
                      <div>
                        <p>{new Date(match.matchDate).toLocaleString()}</p>
                        <p
                          className={
                            match.winnerId === user.id
                              ? 'text-green-500'
                              : match.winnerId === '' && match.loserId === ''
                              ? 'text-gray-500'
                              : 'text-red-500'
                          }
                        >
                          {match.winnerId === user.id
                            ? 'Victory'
                            : match.winnerId === '' && match.loserId === ''
                            ? 'Draw'
                            : 'Defeat'}
                        </p>
                      </div>
                      <div
                        className={`${
                          match.winnerId === user.id
                            ? 'text-green-500'
                            : match.winnerId === '' && match.loserId === ''
                            ? 'text-gray-500'
                            : 'text-red-500'
                        } flex gap-1 items-center`}
                      >
                        <span>
                          {match.winnerId === user.id ? '+' : match.winnerId === '' && match.loserId === '' ? '' : '-'}
                        </span>
                        <span className="text-[24px]">
                          {match.winnerId === user.id ? match.winnerPoint.toString() : match.loserPoint.toString()}
                        </span>
                        <span>LP</span>
                      </div>
                    </div>
                  </div>
                  <div className="collapse-content">
                    <div className="stats stats-vertical flex justify-between bg-transparent lg:stats-horizontal shadow text-center">
                      <div className="stat">
                        <div className="stat-title">Corrects</div>
                        <div className="stat-value text-green-500">
                          {/* @ts-ignore */}
                          {match.matchLog[`user${user.id}`].corrects}
                        </div>
                      </div>

                      <div className="stat">
                        <div className="stat-title">Mistakes</div>
                        <div className="stat-value text-red-500">
                          {/* @ts-ignore */}
                          {Object.keys(match.matchLog[`user${user.id}`].mistakes).length}
                        </div>
                      </div>

                      <div className="stat">
                        <div className="stat-title">Incorrects</div>
                        <div className="stat-value text-red-500">
                          {/* @ts-ignore */}
                          {match.matchLog[`user${user.id}`].incorrects}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}
