import { IMatcherFoundedData, IMatcherRoom, IMatcherRoomData, IMatcherRoomUser } from '@/interfaces/matcher.interface';
import { IGameLanguages } from '@/interfaces/game.interface';
import { ISocketQueueListData, ISocketUser } from '@/interfaces/socket.interface';
import { ICompetitiveGameInformations, ICompetitiveRoom, ICompetitiveRoomUser } from '@/interfaces/competitive.interface';
import { GenerateWord } from './word.generator';
import {
  IPrivateRoomPlayer,
  IPrivateInvisibleRoomPrivacy,
  IPrivateRoomClientParameters,
  IPrivateRoomParameters,
} from '@/interfaces/private-room.interface';
import { init } from '@paralleldrive/cuid2';

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

export const generatePrivateRoomParametersObject = (clientParameters: IPrivateRoomClientParameters): IPrivateRoomParameters => {
  return {
    words: clientParameters.words,
    time: clientParameters.time,
    language: clientParameters.language,
    visibility: clientParameters.visibility,
  };
};

export const generatePrivateRoomUserObject = (user: ISocketUser, ownerSocketId: string): IPrivateRoomPlayer => {
  return {
    email: user.email,
    userId: user.id,
    socketId: ownerSocketId,
    username: user.username,
  };
};

export const generateId = init({
  random: Math.random,
  length: 6,
});

export const generatePrivateRoomPrivacyObject = (): IPrivateInvisibleRoomPrivacy => {
  return {
    cuid: generateId(),
  };
};
