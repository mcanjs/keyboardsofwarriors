import { logger } from '@/utils/logger';
import http from 'http';
import { SOCKET_PORT } from '@/config';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { ISocketQueueStart, ISocketUser } from '@/interfaces/socket.interface';
import Matcher from '@/servers/matcher';
import { PrismaClient } from '@prisma/client';
import { IMatcherFoundedData, IMatcherRoomData } from '@/interfaces/matcher.interface';
import LeaverDedector from '@/core/dedectors/leaver.dedector';
export class ServerSocket {
  private io: SocketIOServer;
  public server: http.Server;
  private matcher: Matcher;
  private prisma = new PrismaClient();
  private leaverDedector = new LeaverDedector();
  private onlineUsers = 0;
  private queueList: string[] = [];
  constructor(appServer: Express.Application) {
    this.server = http.createServer(appServer);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
      },
    });
    this.matcher = new Matcher(this.io, this.prisma);

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

  private async checkUserBannedFromQueue(user: ISocketUser): Promise<boolean> {
    if (typeof user.queueBan && user.queueBan !== '') {
      const updatedUserData = await this.getUserInformations(user.email);
      return this.leaverDedector.checkIsHaveBan(updatedUserData.queueBan);
    }

    return false;
  }

  private async queueStart(socket: Socket, user: ISocketUser, clientParameters: ISocketQueueStart): Promise<void> {
    socket.emit('queue:protocol-loading', true);

    const isHaveBan: boolean = await this.checkUserBannedFromQueue(user);

    if (isHaveBan) {
      socket.emit('queue:banned', user.queueBan);
    } else {
      //? Add queue id
      this.addQueueId(socket.id);

      //? Add user from related room
      await this.matcher.checkRoomsAvailability(clientParameters.activeLangauge, user, socket.id);
    }

    socket.emit('queue:protocol-loading', false);
  }

  private async queueLeave(socket: Socket, user: ISocketUser, clientParameters: IMatcherRoomData): Promise<void> {
    socket.emit('queue:protocol-loading', true);

    //? Remove queue id
    this.removeQueueId(socket.id);

    await this.matcher.userLeft(user, clientParameters);

    socket.emit('queue:protocol-loading', false);
  }

  private async matchAccepted(socket: Socket, clientParameters: IMatcherFoundedData): Promise<void> {
    await this.matcher.userAcceptedMatch(clientParameters, socket.id);
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
      socket.on('queue:leave', this.queueLeave.bind(this, socket, user));

      //? Match accepted event listener
      socket.on('match:accepted', this.matchAccepted.bind(this, socket));

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
