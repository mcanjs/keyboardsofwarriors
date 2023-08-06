import { IGameLanguages, IGameLeagues } from './game.interface';

export type IMatcherRooms = {
  [key in IGameLanguages]: {
    [key in IGameLeagues]: {
      [key: string]: IMatcherRoom;
    };
  };
};

export interface IMatcherRoom {
  users: IMatcherRoomUser[];
}

export interface IMatcherRoomUser {
  email: string;
  username: string;
  socketId: string;
  userId: string;
  matchData: IMatcherRoomUserMatchData;
}

export interface IMatcherRoomUserMatchData {
  isAcceptedMatch: boolean;
}

export interface IMatcherFoundedData {
  queueLanguage: IGameLanguages;
  rank: number;
  roomId: string;
}

export interface IMatcherRoomData {
  queueLanguage: IGameLanguages;
  rank: number;
  roomId: string;
}
