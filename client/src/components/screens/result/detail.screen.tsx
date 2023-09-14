import { Matches, User } from '@prisma/client';
import { JWTPayload } from 'jose';

interface IProps {
  data: Matches | null;
  userId: string | null;
  users: User[] | null;
  auth: JWTPayload | null;
}

export default function ResultDetailScreen({ data, userId, users, auth }: IProps) {
  const calculateAllMistakes = (user: User): number => {
    let mistake = 0;
    /* @ts-ignore */
    const mistakes = Object.keys(data?.matchLog[`user${user.id}`].mistakes);

    for (let i = 0; i < mistakes.length; i++) {
      /* @ts-ignore */
      mistake += data?.matchLog[`user${user.id}`].mistakes[mistakes[i]].length;
    }

    return mistake;
  };

  return (
    <div className="mt-3">
      <div className="flex text-center">
        <p className="flex-1 basis-3/12">User</p>
        <div className="w-[40px] h-[40px]"></div>
        <p className="flex-1 basis-3/12">Corrects</p>
        <p className="flex-1 basis-3/12">Incorrects</p>
        <p className="flex-1 basis-3/12">Total Mistakes</p>
      </div>
      {users &&
        users.map((user, index) => (
          <div
            key={index}
            className={`${(auth?.email as string) === user.email ? 'bg-green-500' : ''} flex items-center mt-3 p-2`}
          >
            <div className="">
              <label tabIndex={0} className="avatar placeholder cursor-pointer">
                <div className="bg-base-300 rounded-full w-[40px] h-[40px]">
                  <span>{user.username.charAt(0).toLocaleUpperCase()}</span>
                </div>
              </label>
            </div>
            <div className={`${auth?.email === user.email ? 'text-black' : ''} flex flex-1 basis-2/3 gap-3 px-3`}>
              <div className="flex-1 basis-1/4">
                <p className={`${(auth?.email as string) === user.email ? 'text-black' : ''}`}>{user.username}</p>
              </div>
              <div className="flex-1 basis-1/4 text-center">
                {/* @ts-ignore */}
                <p>{data?.matchLog[`user${user.id}`].corrects}</p>
              </div>
              <div className="flex-1 basis-1/4 text-center">
                {/* @ts-ignore */}
                <p>{data?.matchLog[`user${user.id}`].incorrects}</p>
              </div>
              <div className="flex-1 basis-1/4 text-center">
                <p>{calculateAllMistakes(user)}</p>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
