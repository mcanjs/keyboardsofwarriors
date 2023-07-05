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
}

/*
    {
        en: {
            bronze: {
                'room1': {

                },
                room2: {

                },
            }
        }
    }
 */
