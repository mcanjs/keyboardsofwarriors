import { IGameLanguages, IGameTimes, IGameWords } from "./game.interface";

export interface ISocketCustomRoomPlayer {
  email: string;
  username: string;
  socketId: string;
  userId: string;
  isOwner: boolean;
  win: number;
  lose: number;
  rank: number;
  gameData: ISocketCustomRoomPlayerGameData;
}

export interface ISocketCustomRoomPlayerGameData {
  isUserReady: boolean;
  isUserConnected: boolean;
  isSeenPreCountdown: boolean;
  isFinishedPreCountdown: boolean;
  isSeenGameScreen: boolean;
}

export interface ISocketCustomRoomParameters {
  language: IGameLanguages;
  isTime: boolean;
  words: IGameWords;
  time: IGameTimes;
}

export interface ISocketCustomRoomDataForClient extends ISocketCustomRoomPlayersDataForClient {
  parameters: ISocketCustomRoomParameters;
}

export interface ISocketCustomRoomPlayersDataForClient {
  owner: undefined | ISocketCustomRoomPlayerDataForClient;
  away: undefined | ISocketCustomRoomPlayerDataForClient;
}

export interface ISocketCustomRoomPlayerDataForClient {
  username: string;
  rank: number;
  win: number;
  lose: number;
  isReady: boolean;
}

export interface ISocketCustomRoomClientData {
  words: string[];
  time: IGameTimes;
  language: IGameLanguages;
  isTime: boolean;
}

