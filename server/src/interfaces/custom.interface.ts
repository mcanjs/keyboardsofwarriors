import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IGameLanguages, IGameTimes, IGameWords } from './game.interface';
import { Namespace, Server as SocketIOServer } from 'socket.io';

export interface ICustomIO {
  def: SocketIOServer;
  custom: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  room: Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
}

export interface ICustomRooms {
  [key: string]: ICustomRoom;
}

export interface ICustomRoom {
  parameters: ICustomRoomParameters;
  roomStatus: ICustomRoomStatus;
  players: ICustomRoomPlayer[];
}

export interface ICustomRoomParameters {
  language: IGameLanguages;
  isTime: boolean;
  words: IGameWords;
  time: IGameTimes;
}

export interface ICustomRoomStatus {
  createDate: Date;
  isGameReady: boolean;
  isPreCountdownStarted: boolean;
  isPreCountdownFinished: boolean;
  isGameStarted: boolean;
  isGameFinished: boolean;
  words: string[];
}

export interface ICustomRoomPlayer {
  email: string;
  username: string;
  socketId: string;
  userId: string;
  isOwner: boolean;
  win: number;
  lose: number;
  rank: number;
  gameData: ICustomRoomPlayerGameData;
}

export interface ICustomRoomPlayerGameData {
  isUserReady: boolean;
  isUserConnected: boolean;
  isSeenPreCountdown: boolean;
  isSeenGameScreen: boolean;
  stat: undefined | ICustomClientGameDataStats;
}

export interface ICustomRoomDataForClient extends ICustomRoomPlayersDataForClient {
  parameters: ICustomRoomParameters;
}

export interface ICustomRoomPlayersDataForClient {
  owner: undefined | ICustomRoomPlayerDataForClient;
  away: undefined | ICustomRoomPlayerDataForClient;
  words: string[];
}

export interface ICustomRoomPlayerDataForClient {
  username: string;
  rank: number;
  isReady: boolean;
  win: number;
  lose: number;
}

export interface ICustomRoomClientData {
  words: string[];
  time: IGameTimes;
  language: IGameLanguages;
  isTime: boolean;
}

export interface ICustomClientIncorrectLetter {
  [key: string]: ICustomClientIncorrectDetail[];
}

export interface ICustomClientIncorrectDetail {
  expectedLetter: string;
  writtenLetter: string;
  letterIndex: number;
}

export interface ICustomClientGameDataStats {
  corrects: number;
  incorrects: number;
  mistakes: ICustomClientIncorrectLetter;
}
