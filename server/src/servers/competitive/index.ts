import { Server as SocketIOServer } from 'socket.io';
import { getGameLanguages, getGameLeagues } from '../getter';
import { ICompetitiveRoom, ICompetitiveRoomUser, ICompetitiveRooms } from '@/interfaces/competitive.interface';
import { IMatcherFoundedData } from '@/interfaces/matcher.interface';
import MMR from '@/core/mmr';

export default class Competitive {
  public competitiveRooms = this.initializeCompetitive();
  private io: SocketIOServer;
  constructor(io: SocketIOServer) {
    this.io = io;
  }

  private initializeCompetitive(): ICompetitiveRooms {
    const rooms = {};
    for (let i = 0; i < getGameLanguages().length; i++) {
      const language = getGameLanguages()[i];
      rooms[language] = {};
      for (let j = 0; j < getGameLeagues().length; j++) {
        const league = getGameLeagues()[j];
        rooms[language][league] = {};
      }
    }
    return rooms as ICompetitiveRooms;
  }

  private async createSocketRoom(matchData: IMatcherFoundedData, users: ICompetitiveRoomUser[]): Promise<void> {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const socket = this.io.sockets.sockets.get(user.socketId);

      if (socket) {
        socket.join(matchData.roomId);
        socket.emit('competitive:accessible', matchData.roomId);
      }
    }

    //? Check is users connected to 10 seconds
    setTimeout(() => {
      this.checkUsersConnectedSuccessfully(matchData);
    }, 10001);
  }

  private async checkUsersConnectedSuccessfully(matchData: IMatcherFoundedData): Promise<void> {
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];

    for (let i = 0; i < room.users.length; i++) {
      const user = room.users[i];

      //? When user not connected in 10 seconds
      if (!user.gameData.isUserJoined) {
        this.io.to(matchData.roomId).emit('competitive:canceled');
      }
    }
  }

  public async createCompetitiveRoom(matchData: IMatcherFoundedData, competitiveRoom: ICompetitiveRoom): Promise<void> {
    const rank = MMR.generateMmrToString(matchData.rank);

    //? Create socket room
    await this.createSocketRoom(matchData, competitiveRoom.users);

    //? Create competitive room
    this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId] = competitiveRoom;
  }

  public async userConnected(matchData: IMatcherFoundedData, socketId: string): Promise<void> {
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];

    for (let i = 0; i < room.users.length; i++) {
      const user = room.users[i];

      if (user.socketId === socketId) {
        user.gameData.isUserJoined = true;
      }
    }

    await this.checkIsGameStartable(matchData);
  }

  private async checkIsGameStartable(matchData: IMatcherFoundedData): Promise<boolean> {
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];
    let isGameStartable = true;

    for (let i = 0; i < room.users.length; i++) {
      const user = room.users[i];

      if (!user.gameData.isUserJoined) {
        isGameStartable = false;
      }
    }

    if (isGameStartable) {
      this.gameStarting(matchData);
    }

    return isGameStartable;
  }

  private async gameStarting(matchData: IMatcherFoundedData): Promise<void> {
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];

    //? Notify to room for game starting
    this.io.to(matchData.roomId).emit('competitive:starting');

    //? Change room state for game started
    room.isGameStarted = true;
  }
}
