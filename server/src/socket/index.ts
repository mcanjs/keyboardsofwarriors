import { FOUND_OPPONENT_WAIT_TIME, MATCH_STARTABLE_WAIT_TIME, MATCH_STARTED_WAIT_TIME, MATCH_STARTING_WAIT_TIME } from '@/config/constants';
import Matcher from '@/core/matcher';
import { logger } from '@/utils/logger';
import { PrismaClient, User } from '@prisma/client';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export class ServerSocket {
  private io: SocketIOServer;
  public server: http.Server;
  public queIds: string[] = [];
  public inPlayingPlayers = 0;
  public matchedUsers: { [key: string]: boolean } = {};
  public prisma = new PrismaClient();
  public matcher = new Matcher();
  constructor(appServer: Express.Application) {
    this.server = http.createServer(appServer);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
      },
    });

    this.connection();
  }

  private addQueId(id: string): void {
    if (this.queIds.indexOf(id) === -1) {
      this.queIds.push(id);
      this.io.emit('queue:counter', this.queIds.length);
    }
  }

  private deleteQueId(id: string): void {
    if (this.queIds.indexOf(id) > -1) {
      this.queIds.splice(this.queIds.indexOf(id), 1);
      this.io.emit('queue:counter', this.queIds.length);
    }
  }

  private async matchRejected(socket: Socket, user: User): Promise<void> {
    const date = new Date();
    await this.prisma.user
      .update({
        where: {
          id: user.id,
        },
        data: {
          queuePosition: '',
          queueBan: new Date(date.getTime() + 30000).toString(),
          isUserInApproval: false,
        },
      })
      .then(() => {
        this.deleteQueId(socket.id);
        //? Client-side reject information
        socket.emit('match:rejected');
      });
  }

  private async updateDatabaseForMatchStarting(roomId: string, socket: Socket, opponentSocket: Socket, user: User, opponent: User): Promise<void> {
    if (!this.matcher.checkCreatedDatabaseInformations(roomId)) {
      await this.prisma.matches.create({
        data: {
          roomId,
          user1Id: user.id,
          user2Id: opponent.id,
          matchDate: new Date().toString(),
        },
      });
      this.matcher.createDatabaseInformations(roomId);
    }
    await this.prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        queuePosition: '',
        matchPosition: roomId,
        isUserInApproval: false,
      },
    });
  }

  private async updateDatabaseForMatchEnding(firstOpponent: User, secondOpponent: User): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        OR: [
          {
            id: firstOpponent.id,
          },
          { id: secondOpponent.id },
        ],
      },
      data: {
        matchPosition: '',
      },
    });
  }

  private async getRoomData(roomId: string) {
    return await this.prisma.matches.findFirst({
      where: {
        roomId,
      },
    });
  }

  private async createSocketRoom(roomId: string, socket: Socket, opponentSocket: Socket): Promise<void> {
    //? Join user to room
    socket.join(roomId);

    //? User emitter
    const roomData = await this.getRoomData(roomId);
    socket.emit('room:joined', JSON.stringify(roomData));
  }

  private usersRoomConnection(roomId: string, socket: Socket): void {
    socket.on('match:connected-user', (id: string) => {
      this.matcher.setUserReady(roomId, id);

      if (this.matcher.checkIsUsersReady(roomId)) {
        this.io.to(roomId).emit('match:startable');
        this.matcher.changeIsMatchStarted(roomId);

        //? Client-side waiting 3 seconds for this working following code
        setTimeout(() => {
          this.io.to(roomId).emit('match:started');
        }, MATCH_STARTED_WAIT_TIME);
      }
    });
  }

  private checkUsersConnectedSuccessfully(roomId: string, socket: Socket, user: User, opponent: User): void {
    setTimeout(() => {
      console.log('match starting wait time ended');
      if (!this.matcher.checkIsMatchStarted(roomId)) {
        //? Match cancel emit todos
        this.io.to(roomId).emit('match:canceled');
        //? Check is who not connected todos
        //? Lose point unconnected user todos

        //? Terminate match but with special commands
        this.updateDatabaseForMatchEnding(user, opponent);
      }
    }, MATCH_STARTING_WAIT_TIME);
  }

  private async matchStarting(roomId: string, socket: Socket, opponentSocket: Socket, user: User, opponent: User) {
    //? Update database
    await this.updateDatabaseForMatchStarting(roomId, socket, opponentSocket, user, opponent);

    //? Create socket room
    await this.createSocketRoom(roomId, socket, opponentSocket);

    //? Redirect users to game page
    socket.emit('match:redirect');

    //? Users and rooms management for starting...
    this.usersRoomConnection(roomId, socket);

    //? Check users connections
    this.checkUsersConnectedSuccessfully(roomId, socket, user, opponent);
  }

  private checkIsMatchStartable(socket: Socket, opponent: User, user: User): void {
    const opponentSocket = this.io.sockets.sockets.get(opponent.queuePosition);
    const roomId: string = this.matcher.createRoom(socket.id, opponentSocket.id);

    socket.on('match:accepted', () => {
      console.log('Accepted match : ', socket.id);
      this.matcher.addUser(roomId, socket.id);
    });

    setTimeout(async () => {
      if (this.matcher.isMatchStartable(roomId)) {
        //? Match starting...
        this.matchStarting(roomId, socket, opponentSocket, user, opponent);
      } else {
        const accepted: string = this.matcher.foundAcceptedMatch(roomId);
        if (accepted !== socket.id) {
          console.log(accepted, socket.id);
          await this.matchRejected(socket, user);
        }
        this.matcher.removeRoom(roomId);
      }
    }, MATCH_STARTABLE_WAIT_TIME);
  }

  private async foundOpponent(socket: Socket, user: User): Promise<void> {
    const socketUser = user;

    let opponent: User | null = null;

    while (this.queIds.indexOf(socket.id) > -1 && !opponent) {
      const onlineUsers = await this.prisma.user.findMany({
        where: {
          queuePosition: {
            not: '',
          },
          isUserInApproval: {
            not: true,
          },
          rank: { gte: socketUser.rank - 10, lte: socketUser.rank + 10 },
          id: { not: socketUser.id },
        },
        orderBy: { rank: 'asc' },
      });

      opponent = onlineUsers[0];

      if (!opponent) {
        await new Promise(resolve => setTimeout(resolve, FOUND_OPPONENT_WAIT_TIME));
      }
    }

    if (opponent) {
      //* Socket Push Event
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isUserInApproval: true,
        },
      });
      socket.emit('match:founded');
      this.checkIsMatchStartable(socket, opponent, user);
    }
  }

  private startQue(socket: Socket): void {
    socket.on('queue:started', ({ email }: { email: string }) => {
      if (this.queIds.indexOf(socket.id) === -1) {
        this.prisma.user
          .update({
            where: {
              email,
            },
            data: {
              queuePosition: socket.id,
            },
          })
          .then((user: User) => {
            console.log(new Date(), new Date(user.queueBan));
            if (user.queueBan && new Date() < new Date(user.queueBan)) {
              socket.emit('queue:ban', user.queueBan);
            } else {
              logger.info(`${email} started queue`);
              this.addQueId(socket.id);
              this.foundOpponent(socket, user);
            }
          });
      }
    });
  }

  private stopQue(socket: Socket): void {
    socket.on('queue:stop', (user: User) => {
      this.prisma.user
        .update({
          where: {
            email: user.email,
          },
          data: {
            queuePosition: '',
          },
        })
        .then(() => {
          logger.info(`${user.email} stopped queue`);
          this.deleteQueId(socket.id);
        });
    });
  }

  private checkRooms(socket: Socket): void {
    socket.on('check:rooms', () => {
      socket.emit('log:rooms', this.matcher.matches);
    });
  }

  private terminateMatch(roomId: string): void {
    if (this.matcher.checkIsMatchStarted(roomId)) {
      this.matcher.removeRoom(roomId);
    }

    this.io.to(roomId).emit('match:ended', () => {
      //? when match ended todos
    });
  }

  private endMatchBecauseUserLeft(roomId: string, user: User): void {
    this.io.to(roomId).emit('user:opponent-left', { email: user.email, id: user.id });

    this.terminateMatch(roomId);
  }

  private async disconnectionControls(socket: Socket, email: any): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (user.matchPosition !== '') {
      this.endMatchBecauseUserLeft(user.matchPosition, user);
    }

    await this.prisma.user.update({
      where: {
        email,
      },
      data: {
        queuePosition: '',
        matchPosition: '',
        isUserInApproval: false,
      },
    });
  }

  private connection() {
    this.io.on('connection', socket => {
      const email = socket.handshake.query.email;
      console.log('One user connected:', socket.id);
      socket.on('disconnect', async () => {
        console.log('One user disconnected', socket.id);
        this.deleteQueId(socket.id);
        await this.disconnectionControls(socket, email);
      });

      //* Start Que
      this.startQue(socket);

      //* Stop Que
      this.stopQue(socket);

      //* Rooms
      this.checkRooms(socket);
    });
  }

  public listen() {
    this.server.listen(4000, () => {
      console.log(`Server listening on port ${4000}`);
    });
  }
}
