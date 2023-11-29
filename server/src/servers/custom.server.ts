import {
  generateCustomRoomClientData,
  generateCustomRoomDataForClient,
  generateCustomRoomObject,
  generateCustomRoomPlayerObject,
} from '@/core/generators/object.generator';
import { GenerateWord } from '@/core/generators/word.generator';
import { ICustomClientGameDataStats, ICustomIO, ICustomRoomParameters, ICustomRooms } from '@/interfaces/custom.interface';
import { ISocketUser } from '@/interfaces/socket.interface';
import { ValidateCustomRoomParams } from '@/utils/validateParams';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';

export default class Custom {
  private io: ICustomIO;
  private prisma = new PrismaClient();
  public customRooms: ICustomRooms = {};

  constructor(io: SocketIOServer) {
    this.io = {
      def: io,
      custom: io.of('/custom'),
      room: io.of('/custom/room'),
    };
    this.prisma = this.prisma;
  }

  private generateUniqueRoomId(): string {
    let roomId = '';
    const chars = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (let i = 0; i < 6; i++) {
      if (i === 0) {
        roomId += chars[Math.floor(Math.random() * chars.length)].toUpperCase();
      } else {
        const random = Math.floor(Math.random() * 2);
        const char = chars[Math.floor(Math.random() * chars.length)].toUpperCase();
        const number = numbers[Math.floor(Math.random() * numbers.length)];
        const digit = random === 0 ? char : number;
        roomId += digit;
      }
    }

    return this.customRooms.hasOwnProperty(roomId) ? this.generateUniqueRoomId() : roomId;
  }

  private checkUserConnectedToTenSecondsInCustomRoom(roomId: string): void {
    setTimeout(() => {
      if (this.customRooms[roomId] && this.customRooms[roomId].players.length < 2) {
        if (this.customRooms[roomId].players.length === 0) {
          delete this.customRooms[roomId];
        }
      }
    }, 10000);
  }

  private redirectUserToRoom(socketId: string, roomId: string): void {
    const socket = this.io.custom.sockets.get(socketId);
    socket.emit('custom:redirect-user-room', roomId);
  }

  private joinUserToSocketRoom(socketId: string, roomId: string): void {
    const socket = this.io.room.sockets.get(socketId);
    socket.join(roomId);
  }

  public async createNewCustomRoom(user: ISocketUser, socketId: string): Promise<void> {
    try {
      const roomId = this.generateUniqueRoomId();
      const roomObject = generateCustomRoomObject();

      //? Create room
      this.customRooms[roomId] = roomObject;

      //? Redirect user to room
      this.redirectUserToRoom(socketId, roomId);

      //? Created room not joined any user automatically delete room for memory safe
      this.checkUserConnectedToTenSecondsInCustomRoom(roomId);
    } catch (e) {
      console.log('Create New Custom Room Error:', e);
    }
  }

  private joinedToRoom(roomId: string): void {
    const roomData = generateCustomRoomDataForClient(this.customRooms[roomId]);
    this.io.room.to(roomId).emit('room:joined', roomData);
  }

  public async checkRoom(roomId: string): Promise<boolean> {
    if (typeof this.customRooms[roomId] === 'undefined' || !this.customRooms[roomId]) {
      return false;
    }

    return true;
  }

  public async addUserToSpecificRoom(user: ISocketUser, socketId: string, roomId: string): Promise<boolean> {
    if (this.customRooms[roomId]) {
      if (this.customRooms[roomId].players.length < 2 && !this.customRooms[roomId].roomStatus.isGameReady) {
        const isOwner = this.customRooms[roomId].players.length === 0 ? true : false;
        const customRoomPlayerObject = generateCustomRoomPlayerObject(user, socketId, isOwner);

        //? Push user object to room data
        this.customRooms[roomId].players.push(customRoomPlayerObject);

        //? Join user to socket room
        this.joinUserToSocketRoom(socketId, roomId);

        //? Give information for user joined to room
        this.joinedToRoom(roomId);

        return true;
      } else {
        const socket = this.io.room.sockets.get(socketId);
        socket.emit('room:fully', roomId);
      }
    } else {
      this.forceDisconnectUser(socketId);
    }

    return false;
  }

  public async kickUserForDisconnected(email: string, roomId: string): Promise<void> {
    const room = this.customRooms[roomId];
    let isOwnerLeft = false;
    if (room && room.players) {
      for (let i = 0; i < room.players.length; i++) {
        const player = room.players[i];

        if (player.email === email) {
          if (player.isOwner) {
            isOwnerLeft = true;
            room.players.splice(i, 1);
          } else {
            room.players.splice(i, 1);
            this.updateClientRoomData(roomId);
          }
        }
      }

      if (room.players.length === 0) {
        delete this.customRooms[roomId];
      } else if (room.roomStatus.isGameStarted || room.roomStatus.isGameReady) {
        this.finishGameForPlayerDisconnected(roomId);
        delete this.customRooms[roomId];
      } else if (isOwnerLeft) {
        room.players[0].isOwner = true;
        this.updateClientRoomData(roomId);
      }
    }
  }

  private finishGameForPlayerDisconnected(roomId: string): void {
    const room = this.customRooms[roomId];

    if (room.players.length === 1) {
      this.io.room.to(roomId).emit('room:player-left');
    }
  }

  public playerFinishedGame(roomId: string): void {
    this.io.room.to(roomId).emit('room:finished');
    delete this.customRooms[roomId];
  }

  public updatePlayerStats(roomId: string, socketId: string, stat: ICustomClientGameDataStats): void {
    try {
      const room = this.customRooms[roomId];
      if (room && room.players.length > 0) {
        for (let i = 0; i < room.players.length; i++) {
          const player = room.players[i];
          if (player.socketId === socketId) {
            player.gameData.stat = stat;
            break;
          }
        }
      }
    } catch (error) {
      console.log('Update player stats error: ', error);
    }
  }

  private updateClientRoomData(roomId: string): void {
    const roomData = generateCustomRoomDataForClient(this.customRooms[roomId]);
    this.io.room.to(roomId).emit('room:update', roomData);
  }

  private checkPlayersEndedPreCountdown(roomId: string): boolean {
    const players = this.customRooms[roomId].players;
    const isPlayable: boolean = players.every(player => player.gameData.isUserReady) && players.length === 2;

    return isPlayable;
  }

  private checkPlayersSeenToGameScreen(roomId: string): boolean {
    if (this.customRooms[roomId]) {
      const players = this.customRooms[roomId].players;
      const isPlayerSeenToGameScreen = players.every(player => player.gameData.isSeenGameScreen) && players.length === 2;
      return isPlayerSeenToGameScreen;
    }

    return false;
  }

  private gameStartable(roomId: string): void {
    try {
      const room = this.customRooms[roomId];

      if (room) {
        const data = generateCustomRoomClientData(room);
        this.io.room.to(roomId).emit('room:start', data);
      }
    } catch (error) {
      console.log('Game startable error:', error);
    }
  }

  public updatePlayerSeenGameScreenData(socketId: string, roomId: string): void {
    try {
      if (this.customRooms[roomId]) {
        const room = this.customRooms[roomId];
        for (let i = 0; i < room.players.length; i++) {
          if (room.players[i].socketId === socketId) {
            room.players[i].gameData.isSeenGameScreen = true;
          }
        }

        //? Check players seen to game screen
        const isStartable: boolean = this.checkPlayersSeenToGameScreen(roomId);

        if (isStartable) this.gameStartable(roomId);
      }
    } catch (e) {
      console.log('Update player seen pre countdown data error', e);
    }
  }

  private redirectUsersToGameScreen(roomId: string): void {
    const room = this.customRooms[roomId];

    if (room) {
      room.roomStatus.isGameReady = true;
      this.io.room.to(roomId).emit('room:redirect-game');
    }
  }

  private startPreCountdown(roomId: string): void {
    try {
      if (this.customRooms[roomId]) {
        const room = this.customRooms[roomId];
        this.io.room.to(roomId).emit('room:pre-countdown-started');
        room.roomStatus.isPreCountdownStarted = true;
        setTimeout(() => {
          const canBeRedirectToTheGameScreen = this.checkPlayersEndedPreCountdown(roomId);
          room.roomStatus.isPreCountdownFinished = true;
          this.io.room.to(roomId).emit('room:pre-countdown-finished');

          if (canBeRedirectToTheGameScreen) {
            this.redirectUsersToGameScreen(roomId);
          }
        }, 5005);
      }
    } catch (e) {
      console.log('Start pre countdown error:', e);
    }
  }

  public updatePlayerSeenPreCountdownData(socketId: string, roomId: string): void {
    try {
      if (this.customRooms[roomId]) {
        const room = this.customRooms[roomId];
        for (let i = 0; i < room.players.length; i++) {
          if (room.players[i].socketId === socketId) {
            room.players[i].gameData.isSeenPreCountdown = true;
          }
        }
      }
    } catch (e) {
      console.log('Update player seen pre countdown data error', e);
    }
  }

  private checkGameIsPlayable(roomId: string): void {
    if (this.customRooms[roomId]) {
      const players = this.customRooms[roomId].players;
      const isPlayable: boolean = players.every(player => player.gameData.isUserReady) && players.length === 2;

      if (isPlayable) {
        this.startPreCountdown(roomId);
      }
    }
  }

  public updateRoomParameters(params: ICustomRoomParameters, socketId: string, roomId: string): void {
    try {
      if (this.customRooms[roomId]) {
        const isValidParams = ValidateCustomRoomParams(params);

        if (isValidParams) {
          if (this.customRooms[roomId].parameters.words !== params.words) {
            this.customRooms[roomId].roomStatus.words = GenerateWord(params.language, params.words);
          }
          this.customRooms[roomId].parameters = params;
          this.updateClientRoomData(roomId);
        } else {
          const socket = this.io.room.sockets.get(socketId);
          socket.emit('room:not-valid-parameters');
        }
      }
    } catch (e) {
      console.log('Update room parameters error:', e);
    }
  }

  public updateUserReadyStatus(userReadyStatus: boolean, socketId: string, roomId: string): void {
    try {
      if (this.customRooms[roomId]) {
        const players = this.customRooms[roomId].players;

        for (let i = 0; i < players.length; i++) {
          const player = players[i];
          if (player.socketId === socketId) {
            players[i].gameData.isUserReady = userReadyStatus;
            this.updateClientRoomData(roomId);
            this.checkGameIsPlayable(roomId);
            break;
          }
        }
      }
    } catch (e) {
      console.log('Update user ready status error:', e);
    }
  }

  public async forceDisconnectUser(socketId: string): Promise<void> {
    const socket = this.io.room.sockets.get(socketId);
    socket.emit('room:force-disconnect');
    socket.disconnect();
  }
}
