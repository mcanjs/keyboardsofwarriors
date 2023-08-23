import { prisma } from '@/src/libs/prisma';
import { Matches, User } from '@prisma/client';
import { JWTPayload } from 'jose';
import { GiNextButton, GiPreviousButton } from 'react-icons/gi';

interface IProps {
  user: User;
}

async function getUserMatches(authedUser: JWTPayload) {
  const matches = await prisma.matches.findMany({
    take: 5,
    orderBy: {
      id: 'desc',
    },
    where: {
      //@ts-ignore
      users: { hasEvery: [authedUser.id] },
    },
  });

  return matches;
}

export default async function ProfileMatchesScreen({ user }: IProps) {
  const matches = await getUserMatches(user);
  const getColor = (match: Matches) => {
    return match.winnerId === user.id
      ? 'text-green-500'
      : match.winnerId === '' && match.loserId === ''
      ? 'text-gray-500'
      : 'text-red-500';
  };

  const getMatchResult = (match: Matches) => {
    return match.winnerId === user.id ? 'Victory' : match.winnerId === '' && match.loserId === '' ? 'Draw' : 'Defeat';
  };

  return matches.length > 0 ? (
    <div className="mt-5">
      {matches.map((match, index) => (
        <div
          key={index}
          className={`${
            matches.length - 1 !== index ? 'border-b border-b-slate-700' : ''
          } bg-base-200 collapse collapse-arrow rounded-none`}
        >
          <input type="radio" name="matches-accordion" />
          <div className="collapse-title text-md font-medium ">
            <div className="flex justify-between items-center">
              <div>
                <p>{match.matchDate.toLocaleString('TR')}</p>
                <p className={getColor(match)}>{getMatchResult(match)}</p>
              </div>
              <div className={`${getColor(match)} flex gap-1 items-center`}>
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
  ) : (
    <div>You dont play any game</div>
  );
}
