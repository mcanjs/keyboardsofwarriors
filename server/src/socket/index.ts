import { logger } from '@/utils/logger';
import http from 'http';
import { SOCKET_PORT } from '@/config';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { ISocketQueueList, ISocketQueueStart, ISocketUser } from '@/interfaces/socket.interface';
import Matcher from '@/servers/matcher';
import { PrismaClient } from '@prisma/client';
import { IMatcherFoundedData, IMatcherRoomData } from '@/interfaces/matcher.interface';
import LeaverDedector from '@/core/dedectors/leaver.dedector';
import Competitive from '@/servers/competitive';
import { generateSocketQueueListDataObject } from '@/core/generators/object.generator';
export class ServerSocket {
  private io: SocketIOServer;
  public server: http.Server;
  private competitive: Competitive;
  private matcher: Matcher;
  private prisma = new PrismaClient();
  private leaverDedector = new LeaverDedector();
  private onlineUsers = 0;
  private queueList: ISocketQueueList = {};
  constructor(appServer: Express.Application) {
    this.server = http.createServer(appServer);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
      },
    });
    this.competitive = new Competitive(this.io);
    this.matcher = new Matcher(this.io, this.competitive);

    this.connection();
  }

  public getQueueList(): ISocketQueueList {
    return this.queueList;
  }

  private addUserToQueueList(email: string, queueData: IMatcherRoomData): void {
    const queueListDataObject = generateSocketQueueListDataObject(email, queueData);
    this.queueList[email] = queueListDataObject;
  }

  private removeUserToQueueList(email: string): void {
    if (typeof this.queueList[email] !== 'undefined') {
      delete this.queueList[email];
    }
  }

  private async checkUserInQueue(email: string): Promise<void> {
    if (typeof this.queueList[email] !== 'undefined') {
      await this.matcher.kickUserFromMatcherRoom(this.queueList[email].activeQueue, email);
      delete this.queueList[email];
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

  private async checkUserBannedFromQueue(socket: Socket, user: ISocketUser): Promise<boolean> {
    const updatedUserData = await this.getUserInformations(user.email);
    const isHaveBan: boolean = await this.leaverDedector.checkIsHaveBan(updatedUserData.queueBan);
    if (typeof user.queueBan && user.queueBan !== '' && isHaveBan) {
      socket.emit('queue:banned', { banTime: updatedUserData.queueBan, serverTime: new Date().toUTCString() });
      return true;
    }

    return false;
  }

  private async queueStart(socket: Socket, user: ISocketUser, clientParameters: ISocketQueueStart): Promise<void> {
    socket.emit('queue:protocol-loading', true);

    const isHaveBan: boolean = await this.checkUserBannedFromQueue(socket, user);

    if (!isHaveBan) {
      //? Add user from related room
      const queueData: IMatcherRoomData = await this.matcher.checkRoomsAvailability(clientParameters.activeLangauge, user, socket.id);

      //? Add queue id
      this.addUserToQueueList(user.email, queueData);
    }

    socket.emit('queue:protocol-loading', false);
  }

  private async queueLeave(socket: Socket, user: ISocketUser, clientParameters: IMatcherRoomData): Promise<void> {
    socket.emit('queue:protocol-loading', true);

    //? Remove queue id
    this.removeUserToQueueList(user.email);

    await this.matcher.userLeft(user, clientParameters);

    socket.emit('queue:protocol-loading', false);
  }

  private async matchAccepted(socket: Socket, clientParameters: IMatcherFoundedData): Promise<void> {
    await this.matcher.userAcceptedMatch(clientParameters, socket.id);
  }

  private adminMatcherRooms(socket: Socket): void {
    socket.emit('admin:log-matcher-rooms', this.matcher.matchRooms);
  }

  private adminCompetitiveRooms(socket: Socket): void {
    socket.emit('admin:log-competitive-rooms', this.competitive.competitiveRooms);
  }

  private async competitiveUserConnected(socket: Socket, clientParameters: IMatcherFoundedData): Promise<void> {
    await this.competitive.userConnected(clientParameters, socket.id);
  }

  private async competitiveGameScreenLoaded(socket: Socket, clientParameters: IMatcherFoundedData): Promise<void> {
    await this.competitive.gameScreenLoaded(clientParameters, socket.id);
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

  private connection(): void {
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
        await this.checkUserInQueue(email as string);

        this.changeOnlineUserStatements('decrease');
        console.log('One user disconnected: ', email);
      });

      //? Queue start event listener
      socket.on('queue:start', this.queueStart.bind(this, socket, user));

      //? Queue leave event listener
      socket.on('queue:leave', this.queueLeave.bind(this, socket, user));

      //? Match accepted event listener
      socket.on('match:accepted', this.matchAccepted.bind(this, socket));

      //? Competitive user connected event listener
      socket.on('competitive:user-connected', this.competitiveUserConnected.bind(this, socket));

      //? Competitive game screen loaded event listener
      socket.on('competitive:game-screen-loaded', this.competitiveGameScreenLoaded.bind(this, socket));

      //? Admin Log event listeners
      socket.on('admin:log-matcher-rooms', this.adminMatcherRooms.bind(this, socket));
      socket.on('admin:log-competitive-rooms', this.adminCompetitiveRooms.bind(this, socket));
    });
  }

  public listen(): void {
    this.server.listen(SOCKET_PORT || 4000, () => {
      logger.info(`🚀 Socket listening on the port ${SOCKET_PORT || 4000}`);
      logger.info(`=======================================`);
    });
  }
}
