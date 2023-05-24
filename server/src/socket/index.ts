import Competitive from '@/core/competitive';
import {
  generateObjectForAcceptedUser,
  generateObjectForCompetitiveRoom,
  generateObjectForMatchRoom,
  generateObjectForRejectedUser,
} from '@/core/generators/object.generator';
import { generateEnglishWords } from '@/core/generators/words.generator';
import Matcher from '@/core/matcher';
import MMR from '@/core/mmr';
import {
  ICompetitiveCorrectNotify,
  ICompetitiveCreating,
  ICompetitiveGetOpponent,
  ICompetitiveRoom,
  ICompetitiveUserConnected,
} from '@/interfaces/competitive.interface';
import {
  IMatchFounded,
  IMatchRanks,
  IMatchRejectedUser,
  IMatchRoomUser,
  IMatchStartableInformation,
  IMatchWaitingUser,
} from '@/interfaces/matcher.interface';
import { PrismaClient, User } from '@prisma/client';
import http from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';

export class ServerSocket {
  private io: SocketIOServer;
  public server: http.Server;
  public queueIds: string[] = [];
  public inPlayingPlayers = 0;
  public matchedUsers: { [key: string]: boolean } = {};
  public prisma = new PrismaClient();
  public matcher = new Matcher();
  public competitive = new Competitive();
  constructor(appServer: Express.Application) {
    this.server = http.createServer(appServer);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
      },
    });

    this.connection();
  }

  private addQueueId(id: string): void {
    if (this.queueIds.indexOf(id) < 0) {
      this.queueIds.push(id);
    }
  }

  private removeQueueId(id: string): void {
    const index = this.queueIds.indexOf(id);
    if (index > -1) {
      this.queueIds.splice(index, 1);
    }
  }

  private async getUserData(email: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  private async updateDatabaseForQueueStartedUser(email: string, tierIndex: number): Promise<void> {
    await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        queueTierIndex: tierIndex,
      },
    });
  }

  private async updateDatabaseForQueueLeftOrDisconnectedUser(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user.queueTierIndex > -1) {
      await this.prisma.user.update({
        where: {
          email,
        },
        data: {
          queueTierIndex: -1,
        },
      });
    }

    if (user.competitiveTierIndex > -1) {
      const rank: IMatchRanks = MMR.generateMmrToString(user.rank);
      const competitiveTierIndex = user.competitiveTierIndex;
      await this.prisma.user.update({
        where: {
          email,
        },
        data: {
          competitiveTierIndex: -1,
        },
      });
      this.notifyOpponentWhenLeftUser(user.email, rank, competitiveTierIndex);
    }

    return user;
  }

  private async updateDatabaseForKickUserFromCompetitive(email: string): Promise<User> {
    return await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        competitiveTierIndex: -1,
      },
    });
  }

  private async notifyOpponentWhenLeftUser(email: string, rank: IMatchRanks, competitiveTierIndex: number): Promise<void> {
    const opponent: ICompetitiveGetOpponent | undefined = this.competitive.getOpponent(email, rank, competitiveTierIndex);

    if (typeof opponent !== 'undefined') {
      await this.updateDatabaseForKickUserFromCompetitive(opponent.email);
      this.io.sockets.sockets.get(opponent.socketId).emit('competitive:opponentLeft');
      //TODO: Left user lose rank
    }
  }

  private async updateDatabaseForJoinedUserCompetitive(email: string, competitiveTierIndex: number): Promise<User> {
    return await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        queueTierIndex: -1,
        competitiveTierIndex,
      },
    });
  }

  private acceptedUserGiveInfoForRejectedUser(acceptersSocketIds: string[], rejectersSocketIds: string[]) {
    for (let i = 0; i < acceptersSocketIds.length; i++) {
      const accepter = acceptersSocketIds[i];
      this.io.to(accepter).emit('match:opponentRejected', rejectersSocketIds[0]);
    }
  }

  private deleteMatcherRoomWhenCompetitiveCreated(rank: IMatchRanks, tierIndex: number) {
    this.matcher.removeMatchRoomForCompetitiveStarted(rank, tierIndex);
  }

  private async createSocketRoom(socket: Socket, rank: IMatchRanks, roomData: ICompetitiveRoom, competitiveTierIndex: number): Promise<void> {
    socket.join(roomData.competitiveId);
    await this.updateDatabaseForJoinedUserCompetitive(socket.handshake.query.email as string, competitiveTierIndex);
    socket.emit('competitive:created', { rank, roomId: roomData.competitiveId, competitiveTierIndex });
  }

  private async createCompetitiveForAccepted(rank: IMatchRanks, tierIndex: number): Promise<void> {
    const users: IMatchRoomUser[] = this.matcher.getRoomUsersForCreating(rank, tierIndex);
    const { roomData, competitiveTierIndex }: ICompetitiveCreating = await this.competitive.createCompetitiveRoom(
      rank,
      generateObjectForCompetitiveRoom(users),
    );

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const socket = this.io.sockets.sockets.get(user.socketId);
      //? Give info for competitive creating
      socket.emit('competitive:creating', user);

      //? Delete matcher room when competitive started
      this.deleteMatcherRoomWhenCompetitiveCreated(rank, tierIndex);
      //? Create room for new competitive
      this.createSocketRoom(socket, rank, roomData, competitiveTierIndex);
    }
  }

  private matchFounded(result: IMatchFounded): void {
    const users = result.usersData;
    for (let i = 0; i < users.length; i++) {
      result.selfData = users[i];
      this.io.to(users[i].socketId).emit('match:founded', result);
    }

    setTimeout(() => {
      //? Check is match startable
      const { isMatchStartable, acceptersSocketIds, rejectersSocketIds }: IMatchStartableInformation = this.matcher.checkIsMatchStartable(
        result.rank,
        result.tierIndex,
      );
      // todo
      if (isMatchStartable) {
        //? Create competitive
        this.createCompetitiveForAccepted(result.rank, result.tierIndex);
      } else {
        this.acceptedUserGiveInfoForRejectedUser(acceptersSocketIds, rejectersSocketIds);
      }
    }, 10005);
  }

  private async queueStart(socket: Socket, email: string): Promise<void> {
    socket.emit('loader:leftFromQueue', true);
    const user = await this.getUserData(email);
    //? Queue started
    this.addQueueId(socket.id);
    //? Found match for new queue
    const result: IMatchWaitingUser | IMatchFounded = this.matcher.checkMatchRoomForNewQueue(user.rank, generateObjectForMatchRoom(user, socket.id));
    await this.updateDatabaseForQueueStartedUser(email, result.tierIndex);
    if ('usersData' in result) {
      this.matchFounded(result);
    } else if ('rank' in result) {
      socket.emit('queue:waitingUserData', result);
    }
    socket.emit('loader:leftFromQueue', false);
  }

  private async queueLeave(socket: Socket, email: string, data: IMatchWaitingUser | undefined): Promise<void> {
    //? Send loader events for fix conflicts....
    socket.emit('loader:leftFromQueue', true);
    //? Left from queue
    this.removeQueueId(socket.id);
    //? Delete Match Room for user left from queue
    if (data) {
      //? If user leaving and when not founded match remove match room
      this.matcher.removeMatchRoom(data.rank, data.tierIndex);
    }
    await this.updateDatabaseForQueueLeftOrDisconnectedUser(email);
    setTimeout(() => {
      socket.emit('loader:leftFromQueue', false);
    }, 1500);
  }

  private async matchAccepted(data: IMatchFounded): Promise<void> {
    console.log('accepted match: ', data.selfData.email);

    const acceptedUserObject = generateObjectForAcceptedUser(data.rank, data.tierIndex, data.selfData);
    await this.matcher.userAcceptedMatch(acceptedUserObject);
  }

  private async matchRejected(data: IMatchFounded): Promise<void> {
    console.log('rejected match: ', data.selfData.email);
    const rejectedUserObject: IMatchRejectedUser = generateObjectForRejectedUser(data.rank, data.tierIndex, data.selfData);
    await this.matcher.terminateMatchWasRejected(rejectedUserObject);
  }

  private async wasDisconnectedUser(email: string): Promise<void> {
    const user: User = await this.updateDatabaseForQueueLeftOrDisconnectedUser(email);
    this.matcher.kickDisconnectedUser(user.rank, user.queueTierIndex, email);
  }

  private competitiveCorrectNotify(data: ICompetitiveCorrectNotify) {
    const { opponentSocketId, totalCorrect } = data;
    this.io.sockets.sockets.get(opponentSocketId).emit('competitive:opponentCorrect', totalCorrect);
  }

  private competitiveUserConnected(socketId: string, data: ICompetitiveUserConnected): void {
    //? Set ready user and return will be notify socket id
    const { willBeNotifySocketId } = this.competitive.setUserReady(data.rank, data.competitiveTierIndex, socketId);
    //? Notify opponent ready
    this.io.sockets.sockets.get(willBeNotifySocketId).emit('competitive:opponentReady');

    //? Check is competitive ready
    const { socketIds, isUsersReady, words, opponentSocketId } = this.competitive.checkIsUsersReady(data.rank, data.competitiveTierIndex, socketId);

    if (isUsersReady) {
      for (let i = 0; i < socketIds.length; i++) {
        this.io.sockets.sockets.get(socketIds[i]).emit('competitive:words', words);
      }
      this.io.sockets.sockets.get(socketId).emit('competitive:opponentId', opponentSocketId);
    }
  }

  private connection() {
    this.io.on('connection', socket => {
      const email = socket.handshake.query.email;
      console.log('One user connected: ', email);

      socket.on('disconnect', async () => {
        console.log('One user disconnected: ', email);
        this.removeQueueId(socket.id);
        //? Disconnected operations
        await this.wasDisconnectedUser(email.toString());
      });

      //? Queue Started Event
      socket.on('queue:start', this.queueStart.bind(this, socket, email));

      //? Queue Leave Event
      socket.on('queue:leave', this.queueLeave.bind(this, socket, email));

      //? Match Accepted Event
      socket.on('match:accepted', this.matchAccepted.bind(this));

      //? Match Rejected Event
      socket.on('match:rejected', this.matchRejected.bind(this));

      //? Match Room logs
      socket.on('logs:matchRooms', () => socket.emit('logs:matchRooms', this.matcher.matchRooms));

      //? Competitive User Connected Event
      socket.on('competitive:userConnected', this.competitiveUserConnected.bind(this, socket.id));

      //? Competitive Opponent Correct Event
      socket.on('competitive:correctNotify', this.competitiveCorrectNotify.bind(this));
    });
  }

  public listen() {
    this.server.listen(4000, () => {
      console.log(`Server listening on port ${4000}`);
    });
  }
}
