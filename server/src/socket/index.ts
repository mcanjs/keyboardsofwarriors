import { ISocketUser } from '@/interfaces/socket.interface';
import { logger } from '@/utils/logger';
import { PrismaClient } from '@prisma/client';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export class ServerSocket {
  private io: SocketIOServer;
  public server: http.Server;
  public queCounter = 0;
  public queIds: string[] = [];
  public inPlayingPlayers = 0;
  public prisma = new PrismaClient();
  constructor(appServer: Express.Application) {
    this.server = http.createServer(appServer);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
      },
    });

    this.connection();
  }

  private deleteQueId(id: string): void {
    if (this.queIds.indexOf(id) > -1) {
      this.queIds.splice(this.queIds.indexOf(id), 1);
    }
  }

  private matchRejected(socket: Socket): void {
    socket.on('match:rejected', () => {
      this.queCounter -= 1;
      //* They are leaving to queue:
      this.deleteQueId(socket.id);
      this.io.emit('queue:counter', this.queCounter);
      socket.disconnect();
    });
  }

  private matchAccepted(socket: Socket): void {
    socket.on('match:accepted', () => {
      // this.queCounter -= 1;
      // this.inPlayingPlayers += 1;
      // this.deleteQueId(socket.id);
      // this.io.emit('queue:counter', this.queCounter);
    });
  }

  private matchAcceptedOppents(socket: Socket): void {
    socket.emit('match:acceptedOpponents');
  }

  private async matchCreate(socket: Socket, user: ISocketUser): Promise<void> {
    const socketUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    const waitTime = 1000;
    let opponent: ISocketUser | null = null;

    while (!opponent) {
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
    }
  }

  private startQue(socket: Socket): void {
    socket.on('queue:started', (user: ISocketUser) => {
      if (this.queIds.indexOf(socket.id) === -1) {
        this.prisma.user
          .update({
            where: {
              email: user.email,
            },
            data: {
              queuePosition: socket.id,
            },
          })
          .then(() => {
            logger.info(`${user.email} started queue`);
            this.queCounter += 1;
            this.queIds.push(socket.id);
            this.io.emit('queue:counter', this.queCounter);
          });
        this.matchCreate(socket, user);
      }
    });
  }

  private stopQue(socket: Socket): void {
    socket.on('queue:stop', (user: ISocketUser) => {
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
          this.queCounter -= 1;
          this.deleteQueId(socket.id);
          this.io.emit('queue:counter', this.queCounter);
        });
    });
  }

  private connection() {
    this.io.on('connection', socket => {
      console.log('One user connected:', socket.id);
      //
      socket.on('disconnect', async () => {
        logger.info(`${socket.id} disconnected`);
        await this.prisma.user
          .updateMany({
            where: {
              queuePosition: socket.id,
            },
            data: {
              queuePosition: '',
            },
          })
          .then(() => {
            if (this.queIds.indexOf(socket.id) > -1) {
              this.queCounter -= 1;
              this.io.emit('queue:counter', this.queCounter);
            }
          });
      });

      //* Start Que
      this.startQue(socket);

      //* Stop Que
      this.stopQue(socket);

      //* Match Found Event
      // this.matchFounded(socket);

      //* Match Accepted
      this.matchAccepted(socket);

      //* Match Rejected
      this.matchRejected(socket);
    });
  }

  public listen() {
    this.server.listen(4000, () => {
      console.log(`Server listening on port ${4000}`);
    });
  }
}
