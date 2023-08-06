import { IMatcherFoundedData, IMatcherRoom, IMatcherRoomData, IMatcherRoomUser } from '@/interfaces/matcher.interface';
import { IGameLanguages } from '@/interfaces/game.interface';
import { ISocketQueueListData, ISocketUser } from '@/interfaces/socket.interface';
import { ICompetitiveGameInformations, ICompetitiveRoom, ICompetitiveRoomUser } from '@/interfaces/competitive.interface';
import { GenerateWord } from './word.generator';

export const generateSocketQueueListDataObject = (email: string, queueData: IMatcherRoomData): ISocketQueueListData => {
  return {
    activeQueue: {
      queueLanguage: queueData.queueLanguage,
      rank: queueData.rank,
      roomId: queueData.roomId,
    },
  };
};

export const generateMatcherRoomUserObject = (user: ISocketUser, socketId: string): IMatcherRoomUser => {
  return {
    email: user.email,
    username: user.username,
    socketId,
    userId: user.id,
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
    userId: user.userId,
    gameData: {
      isUserJoined: false,
      isLoadedScreen: false,
      stats: {
        corrects: 0,
        incorrects: 0,
        mistakes: {},
      },
    },
  };
};

export const generateCompetitiveRoomObject = (matcherRoom: IMatcherRoom, language: IGameLanguages): ICompetitiveRoom => {
  const competitiveRoom: ICompetitiveRoom = {
    users: [],
    isGameStarted: false,
    isGameEnded: false,
    words: GenerateWord(language, 350),
  };

  for (let i = 0; i < matcherRoom.users.length; i++) {
    const user = generateCompetitiveRoomUserObject(matcherRoom.users[i]);
    competitiveRoom.users.push(user);
  }

  return competitiveRoom;
};

export const generateCompetitiveGameInformationsObject = (words: string[], startCountdown: number, finish: number): ICompetitiveGameInformations => {
  return {
    words,
    timeouts: {
      startCountdown,
      finish,
    },
  };
};
