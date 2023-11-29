import { generateSocketCustomInRoomList } from '@/core/generators/object.generator';
import { ICustomClientGameDataStats, ICustomRoomParameters } from '@/interfaces/custom.interface';
import { ISocketCustomInRoomList, ISocketUser } from '@/interfaces/socket.interface';
import Custom from '@/servers/custom.server';
import { PrismaClient } from '@prisma/client';
import { Socket, Server as SocketIOServer } from 'socket.io';

export default class CustomSocket {
  private io: SocketIOServer;
  private prisma = new PrismaClient();
  private custom: Custom;
  private inRoomList: ISocketCustomInRoomList = {};
  constructor(io: SocketIOServer) {
    this.io = io;
    this.custom = new Custom(this.io);

    this.intializeSocket();
  }

  public getInRoomList(): ISocketCustomInRoomList {
    return this.inRoomList;
  }

  private addUserInRoomList(email: string, roomId: string): void {
    const inRoomListDataObject = generateSocketCustomInRoomList(roomId);
    this.inRoomList[email] = inRoomListDataObject;
  }

  private removeUserInRoomList(email: string): void {
    if (typeof this.inRoomList[email] !== 'undefined') {
      delete this.inRoomList[email];
    }
  }

  private async getUserInformations(email: string): Promise<ISocketUser> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        username: true,
        win: true,
        lose: true,
        rank: true,
        queueBan: true,
      },
    });
  }

  private async checkCustomRoom(socket: Socket, user: ISocketUser, roomId: string): Promise<boolean> {
    const roomStatus = await this.custom.checkRoom(roomId);
    if (!roomStatus) {
      await this.custom.forceDisconnectUser(socket.id);
      return false;
    }

    this.connectedRoomSuccessfully(socket, user, roomId);
    return true;
  }

  private async checkUserInRoom(email: string): Promise<void> {
    try {
      if (typeof this.inRoomList[email] !== 'undefined') {
        await this.custom.kickUserForDisconnected(email, this.inRoomList[email].roomId);
        this.removeUserInRoomList(email);
      }
    } catch (e) {
      console.log('[ROOM]: Check user is custom error:', e);
    }
  }

  private async connectedRoomSuccessfully(socket: Socket, user: ISocketUser, roomId: string): Promise<void> {
    const addUser: boolean = await this.custom.addUserToSpecificRoom(user, socket.id, roomId);

    if (addUser) {
      this.addUserInRoomList(user.email, roomId);
    }
  }

  private async customCreate(socket: Socket, user: ISocketUser): Promise<void> {
    await this.custom.createNewCustomRoom(user, socket.id);
  }

  private adminCustomRooms(socket: Socket): void {
    socket.emit('admin:log-custom-rooms', this.custom.customRooms);
  }

  private updateParameters(socket: Socket, clientParameters: ICustomRoomParameters, roomId: string): void {
    this.custom.updateRoomParameters(clientParameters, socket.id, roomId);
  }

  private playeSeenPreCountdown(socket: Socket, roomId: string): void {
    this.custom.updatePlayerSeenPreCountdownData(socket.id, roomId);
  }

  private userReadyStatus(socket: Socket, clientReadyStatus: boolean, roomId: string): void {
    this.custom.updateUserReadyStatus(clientReadyStatus, socket.id, roomId);
  }

  private playerSeenGameScreen(socket: Socket, roomId: string): void {
    this.custom.updatePlayerSeenGameScreenData(socket.id, roomId);
  }

  private playerFinishedGame(socket: Socket, roomId: string): void {
    this.custom.playerFinishedGame(roomId);
  }

  private intializeSocket(): void {
    this.io.of('/custom').on('connection', async socket => {
      const email = socket.handshake.query.email;
      const user = await this.getUserInformations(email as string);
      console.log('One user connected to custom: ', email);

      socket.on('disconnect', async () => {
        console.log('One user disconnected: ', email);
      });

      //? Create new custom room
      socket.on('custom:create', this.customCreate.bind(this, socket, user));

      //? Admin Log event listeners
      socket.on('admin:log-custom-rooms', this.adminCustomRooms.bind(this, socket));
    });

    this.io.of('/custom/room').on('connection', async socket => {
      const email = socket.handshake.query.email;
      const roomId = socket.handshake.query.roomId;
      const user = await this.getUserInformations(email as string);

      console.log('One user connected to custom room: ', email);

      this.checkCustomRoom(socket, user, roomId as string);

      socket.on('disconnect', async () => {
        await this.checkUserInRoom(user.email);
        console.log('One user disconnected: ', email);
      });

      //? Update parameters event listener
      socket.on('room:update-parameters', this.updateParameters.bind(this, socket));

      //? Ready user event listener
      socket.on('room:user-ready-status', this.userReadyStatus.bind(this, socket));

      //? Player seen pre countdown event listener
      socket.on('room:player-seen-pre-countdown', this.playeSeenPreCountdown.bind(this, socket));

      //? Player seen game screen event listener
      socket.on('room:player-seen-game-screen', this.playerSeenGameScreen.bind(this, socket));

      //? Player finished game event listener
      socket.on('room:player-finished', this.playerFinishedGame.bind(this, socket));
    });
  }
}
