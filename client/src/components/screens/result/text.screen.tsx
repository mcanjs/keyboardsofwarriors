import { Matches, Prisma } from "@prisma/client";

interface IProps {
  data: Matches | null;
  userId: string | null;
}

export default function ResultTextScreen({ data, userId }: IProps) {
  const resultColor = () => {
    if (data?.winnerId === userId) {
      return "text-green-500";
    } else if (data?.loserId === userId) {
      return "text-red-400";
    }
    return "text-gray-500";
  };

  const resultText = () => {
    if (data?.winnerId === userId) {
      return "Victory";
    } else if (data?.loserId === userId) {
      return "Defeat";
    } else if (data?.loserId === "" && data?.winnerId === "") {
      return "Draw";
    }

    return "Not found";
  };

  const opponent = () => {
    const matchs = data?.matchLog;
    let user = "";
    //@ts-ignore
    for (let i = 0; i < Object.keys(data?.matchLog).length; i++) {
      //@ts-ignore
      if (Object.keys(matchs)[i] !== `user${userId}`)
        //@ts-ignore
        return (user = Object.keys(matchs)[i]);
    }
    return user;
  };

  //@ts-ignore
  const myMatchLog = data?.matchLog[`user${userId}`];
  //@ts-ignore
  const opponentMatchLog = data?.matchLog[opponent()];

  return (
    <>
      <h1 className="text-3xl font-extrabold sm:text-5xl">
        <strong className={resultColor()}>{resultText()}</strong>
      </h1>

      <div className="flex mt-5 border border-gray-700 rounded">
        <div className="flex flex-col items-center">
          <p className="w-full p-3 border-b border-r border-gray-700 text-[20px] text-green-300 font-bold">
            You
          </p>
          <div className="border-r border-gray-700">
            <div className="stats shadow mt-5">
              <div className="stat">
                <div className="stat-figure text-primary"></div>
                <div className="stat-title">Corrects</div>
                <div className="stat-value text-green-500">
                  {myMatchLog.corrects}
                </div>
              </div>

              <div className="stat">
                <div className="stat-figure text-secondary"></div>
                <div className="stat-title">Incorrects</div>
                <div className="stat-value text-red-500">
                  {myMatchLog.incorrects}
                </div>
              </div>
            </div>
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Incorrects</th>
                  <th>Mistake letters</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(myMatchLog.mistakes).map((el) => (
                  <tr>
                    <td>{el}</td>
                    <td>{el.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <p className="w-full p-3 border-b border-gray-700 text-[20px] text-red-300 font-bold">
            Opponent
          </p>
          <div className="">
            <div className="stats shadow mt-5">
              <div className="stat">
                <div className="stat-figure text-primary"></div>
                <div className="stat-title">Corrects</div>
                <div className="stat-value text-green-500">
                  {opponentMatchLog.corrects}
                </div>
              </div>

              <div className="stat">
                <div className="stat-figure text-secondary"></div>
                <div className="stat-title">Incorrects</div>
                <div className="stat-value text-red-500">
                  {opponentMatchLog.incorrects}
                </div>
              </div>
            </div>
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Incorrects</th>
                  <th>Mistake letters</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(opponentMatchLog.mistakes).map((el) => (
                  <tr>
                    <td>{el}</td>
                    <td>{el.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
