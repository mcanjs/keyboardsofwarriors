import {
  IMatcherFoundedData,
  IMatcherLanguages,
  IMatcherLeagues,
  IMatcherRoom,
  IMatcherRoomData,
  IMatcherRoomUser,
  IMatcherRooms,
} from '@/interfaces/matcher.interface';
import { getMatcherLanguages, getMatcherLeagues } from './getter';
import { ISocketQueueLeave, ISocketUser } from '@/interfaces/socket.interface';
import MMR from '@/core/mmr';
import { generateMatcherFoundedObject, generateMatcherRoomUserObject } from '@/core/generators/object.generator';
import { v4 as generateUniqueId } from 'uuid';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '@/utils/logger';
import { PrismaClient } from '@prisma/client';
import LeaverDedector from '@/core/dedectors/leaver.dedector';

export default class Matcher {
  public matchRooms: IMatcherRooms = this.initializeMatcher();
  private io: SocketIOServer;
  private prisma: PrismaClient;
  private leaverDedector = new LeaverDedector();
  private states = {
    room: {
      maxUser: 2,
    },
  };

  constructor(io: SocketIOServer, prisma: PrismaClient) {
    this.io = io;
    this.prisma = prisma;
  }

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

    for (let i = 0; i < Object.keys(league).length; i++) {
      const room = league[Object.keys(league)[i]];
      const roomUsers = room.users;

      if (roomUsers.length < this.states.room.maxUser) {
        //? Add user from room available
        room.users.push(generateMatcherRoomUserObject(user, socketId));

        const socket = this.io.sockets.sockets.get(socketId);
        socket.emit('match:room-data', { queueLanguage, rank: user.rank, roomId: Object.keys(league)[i] });

        await this.checkIsRoomReadyForApprovalScreen(room, generateMatcherFoundedObject(user, queueLanguage, Object.keys(league)[i]));
        return;
      }
    }

    //? Create new room for not available room
    await this.createRoom(queueLanguage, userMMR, user, socketId);
  }

  public async userLeft(user: ISocketUser, queueData: IMatcherRoomData): Promise<void> {
    try {
      const rank: IMatcherLeagues = MMR.generateMmrToString(queueData.rank);
      const room = this.matchRooms[queueData.queueLanguage][rank][queueData.roomId];

      if (this.states.room.maxUser > room.users.length) {
        //? User can leave
        await this.kickUserFromMatcherRoom(queueData, user.email);
      } else {
        //? Already founded match!
      }
    } catch (e) {
      logger.error(`User left error catcher: ${e}`);
    }
  }

  public async kickUserFromMatcherRoom(queueData: IMatcherRoomData, email: string): Promise<void> {
    const rank: IMatcherLeagues = MMR.generateMmrToString(queueData.rank);
    const room = this.matchRooms[queueData.queueLanguage][rank][queueData.roomId];
    for (let i = 0; i < room.users.length; i++) {
      const user = room.users[i];

      if (user.email === email) {
        room.users.splice(i, 1);
      }
    }
  }

  private async createRoom(language: IMatcherLanguages, league: IMatcherLeagues, user: ISocketUser, socketId: string): Promise<void> {
    const roomId = generateUniqueId();

    this.matchRooms[language][league][roomId] = {
      users: [generateMatcherRoomUserObject(user, socketId)],
    };

    const socket = this.io.sockets.sockets.get(socketId);
    socket.emit('match:room-data', { queueLanguage: language, rank: user.rank, roomId });
  }

  private async showApprovalScreenForUsers(users: IMatcherRoomUser[], matchData: IMatcherFoundedData): Promise<void> {
    for (let i = 0; i < users.length; i++) {
      const socket = this.io.sockets.sockets.get(users[i].socketId);
      socket.emit('match:founded', matchData);
    }

    setTimeout(() => {
      this.checkUsersReadyForCompetitive(matchData);
    }, 10001);
  }

  private async checkIsRoomReadyForApprovalScreen(roomData: IMatcherRoom, matchData: IMatcherFoundedData): Promise<void> {
    if (roomData.users.length === this.states.room.maxUser) {
      this.showApprovalScreenForUsers(roomData.users, matchData);
    } else if (roomData.users.length > this.states.room.maxUser) {
      //? When reached to room kick user
      const rank: IMatcherLeagues = MMR.generateMmrToString(matchData.rank);
      const room = this.matchRooms[matchData.queueLanguage][rank][matchData.roomId];

      room.users.splice(room.users.length - 1, 1);
      this.checkIsRoomReadyForApprovalScreen(roomData, matchData);
    }
  }

  public async userAcceptedMatch(roomData: IMatcherFoundedData, socketId: string): Promise<void> {
    const rank: IMatcherLeagues = MMR.generateMmrToString(roomData.rank);
    const room = this.matchRooms[roomData.queueLanguage][rank][roomData.roomId];

    for (let i = 0; i < room.users.length; i++) {
      const user = room.users[i];

      if (user.socketId === socketId) {
        user.matchData.isAcceptedMatch = true;
      }
    }
  }

  public async kickUsersForNotAcceptedMatch(matchData: IMatcherFoundedData): Promise<void> {
    const rank: IMatcherLeagues = MMR.generateMmrToString(matchData.rank);
    const room = this.matchRooms[matchData.queueLanguage][rank][matchData.roomId];

    for (let i = room.users.length - 1; i >= 0; i--) {
      const user = room.users[i];

      if (!user.matchData.isAcceptedMatch) {
        await this.punishmentNotAcceptedUser(user);
        room.users.splice(i, 1);
      } else {
        user.matchData.isAcceptedMatch = false;
      }
    }
  }

  public async punishmentNotAcceptedUser(userData: IMatcherRoomUser): Promise<void> {
    const queueBan = await this.leaverDedector.createBanDate();
    await this.prisma.user.update({
      where: {
        email: userData.email,
      },
      data: {
        queueBan,
      },
    });
  }

  private async checkUsersReadyForCompetitive(matchData: IMatcherFoundedData): Promise<void> {
    try {
      const rank: IMatcherLeagues = MMR.generateMmrToString(matchData.rank);
      const room = this.matchRooms[matchData.queueLanguage][rank][matchData.roomId];

      await this.kickUsersForNotAcceptedMatch(matchData);

      if (room.users.length === this.states.room.maxUser) {
        //? If still have 2 player and accepted from match go to game screen
      }
    } catch (e) {
      logger.error(`Check user ready for competitive error catcher : ${e}`);
    }
  }
}
