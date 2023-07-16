import { IGameLanguages, IGameLeagues } from './game.interface';

export type ICompetitiveRooms = {
  [key in IGameLanguages]: {
    [key in IGameLeagues]: {
      [key: string]: ICompetitiveRoom;
    };
  };
};

export interface ICompetitiveRoom {
  users: ICompetitiveRoomUser[];
  isGameStarted: boolean;
}

export interface ICompetitiveRoomUser {
  email: string;
  username: string;
  socketId: string;
  gameData: ICompetitiveGameData;
}

export interface ICompetitiveGameData {
  isUserJoined: boolean;
}
