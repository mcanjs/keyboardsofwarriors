import { IMatcherFoundedData, IMatcherRoom, IMatcherRoomUser } from '@/interfaces/matcher.interface';
import { IGameLanguages } from '@/interfaces/game.interface';
import { ISocketUser } from '@/interfaces/socket.interface';
import { ICompetitiveRoom, ICompetitiveRoomUser } from '@/interfaces/competitive.interface';

export const generateMatcherRoomUserObject = (user: ISocketUser, socketId: string): IMatcherRoomUser => {
  return {
    email: user.email,
    username: user.username,
    socketId,
    matchData: {
      isAcceptedMatch: false,
    },
  };
};

export const generateMatcherFoundedObject = (user: ISocketUser, language: IGameLanguages, roomId: string): IMatcherFoundedData => {
  return {
    queueLanguage: language,
    roomId,
    rank: user.rank,
  };
};

export const generateCompetitiveRoomUserObject = (user: IMatcherRoomUser): ICompetitiveRoomUser => {
  return {
    email: user.email,
    username: user.username,
    socketId: user.socketId,
    gameData: {
      isUserJoined: false,
    },
  };
};

export const generateCompetitiveRoomObject = (matcherRoom: IMatcherRoom): ICompetitiveRoom => {
  const competitiveRoom: ICompetitiveRoom = {
    users: [],
    isGameStarted: false,
  };

  for (let i = 0; i < matcherRoom.users.length; i++) {
    const user = generateCompetitiveRoomUserObject(matcherRoom.users[i]);
    competitiveRoom.users.push(user);
  }

  return competitiveRoom;
};
