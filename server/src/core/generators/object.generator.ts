import { IMatcherFoundedData, IMatcherLanguages, IMatcherRoomUser } from '@/interfaces/matcher.interface';
import { ISocketUser } from '@/interfaces/socket.interface';

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

export const generateMatcherFoundedObject = (user: ISocketUser, language: IMatcherLanguages, roomId: string): IMatcherFoundedData => {
  return {
    queueLanguage: language,
    roomId,
    rank: user.rank,
  };
};
