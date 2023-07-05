import { IMatcherLanguages, IMatcherLeagues, IMatcherRoom, IMatcherRooms } from '@/interfaces/matcher.interface';
import { getMatcherLanguages, getMatcherLeagues } from './getter';
import { ISocketUser } from '@/interfaces/socket.interface';
import MMR from '@/core/mmr';
import { generateMatcherRoomUserObject } from '@/core/generators/object.generator';
import { v4 as generateUniqueId } from 'uuid';

export default class Matcher {
  public matchRooms: IMatcherRooms = this.initializeMatcher();
  private states = {
    room: {
      maxUser: 2,
    },
  };

  private initializeMatcher(): IMatcherRooms {
    const rooms = {};
    for (let i = 0; i < getMatcherLanguages().length; i++) {
      const language = getMatcherLanguages()[i];
      rooms[language] = {};
      for (let j = 0; j < getMatcherLeagues().length; j++) {
        const league = getMatcherLeagues()[j];
        rooms[language][league] = {};
      }
    }
    return rooms as IMatcherRooms;
  }

  public async checkRoomsAvailability(queueLanguage: IMatcherLanguages, user: ISocketUser, socketId: string): Promise<void> {
    const userMMR: IMatcherLeagues = MMR.generateMmrToString(user.rank);
    const league = this.matchRooms[queueLanguage][userMMR];
    // league.f = {
    //   users: [
    //     {
    //       email: user.email,
    //       socketId: socketId,
    //       username: user.username,
    //     },
    //   ],
    // };

    for (let i = 0; i < Object.keys(league).length; i++) {
      const room = league[Object.keys(league)[i]];
      const roomUsers = room.users;

      if (roomUsers.length < this.states.room.maxUser) {
        //? Add user from room available
        room.users.push(generateMatcherRoomUserObject(user, socketId));

        await this.checkIsRoomReadyForApprovalScreen(room);
        return;
      }
    }

    //? Create new room for not available room
    await this.createRoom(queueLanguage, userMMR, user, socketId);
  }

  private async createRoom(language: IMatcherLanguages, league: IMatcherLeagues, user: ISocketUser, socketId: string): Promise<void> {
    const roomId = generateUniqueId();

    this.matchRooms[language][league][roomId] = {
      users: [generateMatcherRoomUserObject(user, socketId)],
    };
  }

  private async checkIsRoomReadyForApprovalScreen(room: IMatcherRoom): Promise<void> {
    for (let i = 0; i < room.users.length; i++) {
      //TODO
      // if (room.users[i])
    }
  }
}
