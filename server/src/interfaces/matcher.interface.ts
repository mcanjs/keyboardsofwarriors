export type IMatcherRooms = {
  [key in IMatcherLanguages]: {
    [key in IMatcherLeagues]: {
      [key: string]: IMatcherRoom;
    };
  };
};

export type IMatcherLanguages = 'en' | 'tr';

export type IMatcherLeagues = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legend';

export interface IMatcherRoom {
  users: IMatcherRoomUser[];
}

export interface IMatcherRoomUser {
  email: string;
  username: string;
  socketId: string;
  matchData: IMatcherRoomUserMatchData;
}

export interface IMatcherRoomUserMatchData {
  isAcceptedMatch: boolean;
}

export interface IMatcherFoundedData {
  queueLanguage: IMatcherLanguages;
  rank: number;
  roomId: string;
}

export interface IMatcherRoomData {
  queueLanguage: string;
  rank: number;
  roomId: string;
}
