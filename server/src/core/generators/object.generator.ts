import { IMatcherFoundedData, IMatcherRoom, IMatcherRoomData, IMatcherRoomUser } from '@/interfaces/matcher.interface';
import { IGameLanguages } from '@/interfaces/game.interface';
import { ISocketCustomInRoomData, ISocketQueueListData, ISocketUser } from '@/interfaces/socket.interface';
import { ICompetitiveGameInformations, ICompetitiveRoom, ICompetitiveRoomUser } from '@/interfaces/competitive.interface';
import { GenerateWord } from './word.generator';
import {
  ICustomRoom,
  ICustomRoomClientData,
  ICustomRoomDataForClient,
  ICustomRoomParameters,
  ICustomRoomPlayer,
  ICustomRoomPlayerGameData,
  ICustomRoomPlayersDataForClient,
  ICustomRoomStatus,
} from '@/interfaces/custom.interface';

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

export const generateCustomRoomParametersObject = (): ICustomRoomParameters => {
  return {
    language: 'en',
    isTime: false,
    time: 120,
    words: 50,
  };
};

export const generateCustomRoomStatusObject = (language: IGameLanguages, requestedWord: number): ICustomRoomStatus => {
  return {
    createDate: new Date(),
    isGameReady: false,
    isPreCountdownStarted: false,
    isPreCountdownFinished: false,
    isGameStarted: false,
    isGameFinished: false,
    words: GenerateWord(language, requestedWord),
  };
};

export const generateCustomRoomPlayerGameDataObject = (): ICustomRoomPlayerGameData => {
  return {
    isUserReady: false,
    isUserConnected: false,
    isSeenGameScreen: false,
    isSeenPreCountdown: false,
    stat: undefined,
  };
};

export const generateCustomRoomPlayerObject = (user: ISocketUser, socketId: string, isOwner: boolean): ICustomRoomPlayer => {
  const { email, username, id, win, lose, rank } = user;
  return {
    email,
    username,
    userId: id,
    socketId,
    isOwner,
    win,
    lose,
    rank,
    gameData: generateCustomRoomPlayerGameDataObject(),
  };
};

export const generateCustomRoomObject = (): ICustomRoom => {
  const params = generateCustomRoomParametersObject();
  return {
    parameters: params,
    roomStatus: generateCustomRoomStatusObject(params.language, params.words),
    players: [],
  };
};

export const generateCustomRoomPlayersObjectForClient = (players: ICustomRoomPlayer[], words: string[]): ICustomRoomPlayersDataForClient => {
  const data: ICustomRoomPlayersDataForClient = {
    owner: undefined,
    away: undefined,
    words,
  };

  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    if (player.isOwner) {
      data.owner = {
        username: player.username,
        rank: player.rank,
        win: player.win,
        lose: player.lose,
        isReady: player.gameData.isUserReady,
      };
    } else {
      data.away = {
        username: player.username,
        rank: player.rank,
        win: player.win,
        lose: player.lose,
        isReady: player.gameData.isUserReady,
      };
    }
  }

  return data;
};

export const generateCustomRoomDataForClient = (roomData: ICustomRoom): ICustomRoomDataForClient => {
  const { owner, away } = generateCustomRoomPlayersObjectForClient(roomData.players, roomData.roomStatus.words);
  return {
    parameters: roomData.parameters,
    owner,
    away,
    words: roomData.roomStatus.words,
  };
};

export const generateSocketCustomInRoomList = (roomId: string): ISocketCustomInRoomData => {
  return {
    roomId,
  };
};

export const generateCustomRoomClientData = (roomData: ICustomRoom): ICustomRoomClientData => {
  return {
    words: roomData.roomStatus.words,
    time: roomData.parameters.time,
    isTime: roomData.parameters.isTime,
    language: roomData.parameters.language,
  };
};
