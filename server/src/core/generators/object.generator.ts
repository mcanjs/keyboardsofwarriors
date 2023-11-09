import { IMatcherFoundedData, IMatcherRoom, IMatcherRoomData, IMatcherRoomUser } from '@/interfaces/matcher.interface';
import { IGameLanguages } from '@/interfaces/game.interface';
import { ISocketCustomInRoomData, ISocketQueueListData, ISocketUser } from '@/interfaces/socket.interface';
import { ICompetitiveGameInformations, ICompetitiveRoom, ICompetitiveRoomUser } from '@/interfaces/competitive.interface';
import { GenerateWord } from './word.generator';
import {
  ICustomRoom,
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

export const generateCustomRoomStatusObject = (): ICustomRoomStatus => {
  return {
    createDate: new Date(),
    isGameReady: false,
    isPreCountdownStarted: false,
    isPreCountdownFinished: false,
    isGameStarted: false,
    isGameFinished: false,
  };
};

export const generateCustomRoomPlayerGameDataObject = (): ICustomRoomPlayerGameData => {
  return {
    isUserReady: false,
    isUserConnected: false,
    isSeenGameScreen: false,
    isSeenPreCountdown: false,
    isFinishedPreCountdown: false,
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
  return {
    parameters: generateCustomRoomParametersObject(),
    roomStatus: generateCustomRoomStatusObject(),
    players: [],
  };
};

export const generateCustomRoomPlayersObjectForClient = (players: ICustomRoomPlayer[]): ICustomRoomPlayersDataForClient => {
  const data: ICustomRoomPlayersDataForClient = {
    owner: undefined,
    away: undefined,
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
  const { owner, away } = generateCustomRoomPlayersObjectForClient(roomData.players);
  return {
    parameters: roomData.parameters,
    owner,
    away,
  };
};

export const generateSocketCustomInRoomList = (roomId: string): ISocketCustomInRoomData => {
  return {
    roomId,
  };
};
