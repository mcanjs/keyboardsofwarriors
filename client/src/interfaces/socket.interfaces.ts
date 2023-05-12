export type ISocketMatchRanks =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandMaster'
  | 'challenger';

export interface ISocketMatchWatingUserData {
  tierIndex: number;
  rank: ISocketMatchRanks;
}

export interface ISocketMatchRoomUsers {
  email: string;
  username: string;
  socketId: string;
  isUserReady: boolean;
}

export interface ISocketMatchFounded {
  usersData: ISocketMatchRoomUsers[];
  selfData: ISocketMatchRoomUsers;
  tierIndex: number;
  rank: ISocketMatchRanks;
}
