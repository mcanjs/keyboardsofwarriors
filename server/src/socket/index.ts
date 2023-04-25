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
        },
      })
      .then(() => {
        this.deleteQueId(socket.id);
        //? Client-side reject information
        socket.emit('match:rejected');
      });
  }

  private async updateDatabase(roomId: string, socket: Socket, opponentSocket: Socket, user: User, opponent: User): Promise<void> {
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

  private async matchStarting(roomId: string, socket: Socket, opponentSocket: Socket, user: User, opponent: User) {
    //? Update database
    await this.updateDatabase(roomId, socket, opponentSocket, user, opponent);

    //? Create socket room
    await this.createSocketRoom(roomId, socket, opponentSocket);

    socket.emit('match:starting');

    socket.on('user:connected', (id: string) => {
      console.log(`connected user: ${id}`);
    });
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
          await this.matchRejected(socket, user);
        }
        this.matcher.removeRoom(roomId);
      }
    }, 10001);
  }

  private async foundOpponent(socket: Socket, user: User): Promise<void> {
    const socketUser = user;

    const waitTime = 1000;
    let opponent: User | null = null;

    while (this.queIds.indexOf(socket.id) > -1 && !opponent) {
      const onlineUsers = await this.prisma.user.findMany({
        where: {
          queuePosition: {
            not: '',
          },
          rank: { gte: socketUser.rank - 10, lte: socketUser.rank + 10 },
          id: { not: socketUser.id },
        },
        orderBy: { rank: 'asc' },
      });

      opponent = onlineUsers[0];

      if (!opponent) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    if (opponent) {
      //* Socket Push Event
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
            console.log(new Date(user.queueBan), user.queueBan);
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

  private checkRooms(socket: Socket) {
    socket.on('check:rooms', () => {
      socket.emit('log:rooms', this.matcher.matches);
    });
  }

  private connection() {
    this.io.on('connection', socket => {
      console.log('One user connected:', socket.id);
      socket.on('disconnect', async () => {
        console.log('One user disconnected', socket.id);
        this.deleteQueId(socket.id);
        await this.prisma.user.updateMany({
          where: {
            queuePosition: socket.id,
          },
          data: {
            queuePosition: '',
            matchPosition: '',
          },
        });
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
