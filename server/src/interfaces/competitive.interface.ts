import { IMatchRanks, IMatchRoomUser } from './matcher.interface';

export interface ICompetitiveRoom {
  isCompetitiveStarted: boolean;
  isCompetitiveReady: boolean;
  isCompetitiveEnded: boolean;
  competitiveId: string;
  words: string[];
  opponents: IMatchRoomUser[];
}

export interface ICompetitiveCreating {
  competitiveTierIndex: number;
  rank: IMatchRanks;
  roomData: ICompetitiveRoom;
}

export interface ICompetitiveUserConnected {
  competitiveTierIndex: number;
  rank: IMatchRanks;
}

export interface ICompetitiveRooms {
  bronze: ICompetitiveRoom[];
  silver: ICompetitiveRoom[];
  gold: ICompetitiveRoom[];
  platinum: ICompetitiveRoom[];
  diamond: ICompetitiveRoom[];
  grandMaster: ICompetitiveRoom[];
  challenger: ICompetitiveRoom[];
}

export interface ICompetitiveSetUserReady {
  willBeNotifySocketId: string;
}

export interface ICompetitiveCheckUserReady {
  socketIds: string[];
  isUsersReady: boolean;
  words: string[];
  opponentSocketId: string;
}

export interface ICompetitiveCorrectNotify {
  opponentSocketId: string;
  totalCorrect: number;
}

export interface ICompetitiveGetOpponent {
  socketId: string;
  email: string;
}
