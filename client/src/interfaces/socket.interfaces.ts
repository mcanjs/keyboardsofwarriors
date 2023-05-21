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

export interface ISocketMatchRoomUser {
  email: string;
  username: string;
  socketId: string;
  isUserReady: boolean;
  isUserJoinedToRoom: boolean;
}

export interface ISocketMatchFounded {
  usersData: ISocketMatchRoomUser[];
  selfData: ISocketMatchRoomUser;
  tierIndex: number;
  rank: ISocketMatchRanks;
}

export interface ISocketCompetitiveCreated {
  rank: ISocketMatchRanks;
  competitiveId: string;
  competitiveTierIndex: number;
}

export interface ISocketCompetitiveUserConnected {
  rank: ISocketMatchRanks;
  competitiveTierIndex: number;
}
