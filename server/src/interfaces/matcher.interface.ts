export interface IMatchRoomUser {
  email: string;
  username: string;
  socketId: string;
  isUserReady: boolean;
  isUserJoinedToRoom: boolean;
}

export interface IMatchWaitingUser {
  tierIndex: number;
  rank: IMatchRanks;
}

export interface IMatchFounded {
  usersData: IMatchRoomUser[];
  selfData: IMatchRoomUser;
  tierIndex: number;
  rank: IMatchRanks;
}

export interface IMatchAcceptedUser {
  rank: IMatchRanks;
  tierIndex: number;
  userData: IMatchRoomUser;
}

export interface IMatchRejectedUser {
  rank: IMatchRanks;
  tierIndex: number;
  userData: IMatchRoomUser;
}

export interface IMatchStartableInformation {
  isMatchStartable: boolean;
  rank: IMatchRanks;
  tierIndex: number;
  rejectersSocketIds: string[];
  acceptersSocketIds: string[];
}

export interface IMatchRooms {
  bronze: IMatchRoomUser[][];
  silver: IMatchRoomUser[][];
  gold: IMatchRoomUser[][];
  platinum: IMatchRoomUser[][];
  diamond: IMatchRoomUser[][];
  master: IMatchRoomUser[][];
  grandMaster: IMatchRoomUser[][];
  challenger: IMatchRoomUser[][];
}

export type IMatchRanks = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandMaster' | 'challenger' | 'f';
