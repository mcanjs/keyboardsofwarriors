import { logger } from '@/utils/logger';
import http from 'http';
import { SOCKET_PORT } from '@/config';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { ISocketQueueLeave, ISocketQueueStart, ISocketUser } from '@/interfaces/socket.interface';
import Matcher from '@/servers/matcher';
import { PrismaClient } from '@prisma/client';
export class ServerSocket {
  private io: SocketIOServer;
  public server: http.Server;
  public matcher = new Matcher();
  private prisma = new PrismaClient();
  private onlineUsers = 0;
  private queueList: string[] = [];
  constructor(appServer: Express.Application) {
    this.server = http.createServer(appServer);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
      },
    });

    this.connection();
  }

  private addQueueId(id: string) {
    if (this.queueList.indexOf(id) === -1) {
      this.queueList.push(id);
    }
  }

  private removeQueueId(id: string) {
    if (this.queueList.indexOf(id) > -1) {
      this.queueList.splice(this.queueList.indexOf(id), 1);
    }
  }

  private changeOnlineUserStatements(type?: 'increase' | 'decrease'): void {
    if (type === 'increase') {
      this.onlineUsers += 1;
    } else if (type === 'decrease') {
      this.onlineUsers -= 1;
    }

    this.io.emit('system:online-users', this.onlineUsers);
  }

  private async queueStart(socket: Socket, user: ISocketUser, clientParameters: ISocketQueueStart): Promise<void> {
    socket.emit('queue:protocol-loading', true);
    //? Add queue id
    this.addQueueId(socket.id);

    //? Add user from related room
    await this.matcher.checkRoomsAvailability(clientParameters.activeLangauge, user, socket.id);

    socket.emit('queue:protocol-loading', false);
  }

  private queueLeave(socket: Socket, clientParameters: ISocketQueueLeave): void {
    //? Remove queue id
    this.removeQueueId(socket.id);
  }

  private adminLogRoom(socket: Socket): void {
    socket.emit('admin:log-room', this.matcher.matchRooms);
  }

  private async getUserInformations(email: string): Promise<ISocketUser> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
        username: true,
        win: true,
        lose: true,
        rank: true,
        queueBan: true,
      },
    });
  }

  private connection() {
    this.io.on('connection', async socket => {
      const email = socket.handshake.query.email;
      const user = await this.getUserInformations(email as string);
      console.log('One user connected: ', email);

      //? Give first info from client
      this.changeOnlineUserStatements();

      //? Add online user statement
      this.changeOnlineUserStatements('increase');

      socket.on('disconnect', async () => {
        //? Remove online user statement
        this.changeOnlineUserStatements('decrease');
        console.log('One user disconnected: ', email);
      });

      //? Queue start event listener
      socket.on('queue:start', this.queueStart.bind(this, socket, user));

      //? Queue leave event listener
      socket.on('queue:leave', this.queueLeave.bind(this, socket));

      //? Admin Log event listeners
      socket.on('admin:log-room', this.adminLogRoom.bind(this, socket));
    });
  }

  public listen() {
    this.server.listen(SOCKET_PORT || 4000, () => {
      logger.info(`🚀 Socket listening on the port ${SOCKET_PORT || 4000}`);
      logger.info(`=======================================`);
    });
  }
}
