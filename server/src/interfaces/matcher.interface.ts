export interface IMatchRoomUsers {
  email: string;
  username: string;
  socketId: string;
  isUserReady: boolean;
}

export interface IMatchWatingUser {
  tierIndex: number;
  rank: IMatchRanks;
}

export interface IMatchFounded {
  usersData: IMatchRoomUsers[];
  selfData: IMatchRoomUsers;
  tierIndex: number;
  rank: IMatchRanks;
}

export interface IMatchRooms {
  bronze: IMatchRoomUsers[][];
  silver: IMatchRoomUsers[][];
  gold: IMatchRoomUsers[][];
  platinum: IMatchRoomUsers[][];
  diamond: IMatchRoomUsers[][];
  master: IMatchRoomUsers[][];
  grandMaster: IMatchRoomUsers[][];
  challenger: IMatchRoomUsers[][];
}

export type IMatchRanks = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandMaster' | 'challenger';
