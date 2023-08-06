import { IGameLanguages, IGameLeagues } from './game.interface';
import { IMatcherFoundedData } from './matcher.interface';

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
  isGameEnded: boolean;
  words: string[];
}

export interface ICompetitiveRoomUser {
  email: string;
  username: string;
  socketId: string;
  userId: string;
  gameData: ICompetitiveGameData;
}

export interface ICompetitiveGameData {
  isUserJoined: boolean;
  isLoadedScreen: boolean;
  stats: ICompetitiveGameDataStats;
}

export interface ICompetitiveGameDataStats {
  corrects: number;
  incorrects: number;
  mistakes: ICompetitiveIncorrectLetter;
}

export interface ICompetitiveIncorrectLetter {
  [key: string]: ICompetitiveIncorrectDetail[];
}

export interface ICompetitiveIncorrectDetail {
  expectedLetter: string;
  writtenLetter: string;
  letterIndex: number;
}

export interface ICompetitiveGameInformations {
  words: string[];
  timeouts: {
    startCountdown: number;
    finish: number;
  };
}

export interface ICompetitiveMistakeClientParameters {
  word: string;
  mistake: ICompetitiveIncorrectDetail;
  matchData: IMatcherFoundedData;
}

export interface ICompetitiveCalculateResult {
  winnerId: string;
  loserId: string;
}
