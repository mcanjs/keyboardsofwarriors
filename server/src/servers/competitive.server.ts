import { Server as SocketIOServer } from 'socket.io';
import { getGameLanguages, getGameLeagues } from './getter';
import {
  ICompetitiveCalculateResult,
  ICompetitiveGameInformations,
  ICompetitiveMistakeClientParameters,
  ICompetitiveRoom,
  ICompetitiveRoomUser,
  ICompetitiveRooms,
} from '@/interfaces/competitive.interface';
import { IMatcherFoundedData } from '@/interfaces/matcher.interface';
import MMR from '@/core/mmr';
import { IGameLeagues } from '@/interfaces/game.interface';
import { logger } from '@/utils/logger';
import { generateCompetitiveGameInformationsObject } from '@/core/generators/object.generator';
import { PrismaClient } from '@prisma/client';
import MMRCalculator from '@/core/mmr/calculator';

export default class Competitive {
  public competitiveRooms = this.initializeCompetitive();
  private prisma = new PrismaClient();
  private io: SocketIOServer;
  private mmrCalculator = new MMRCalculator();
  private states = {
    timeouts: {
      connection: 10001,
      startCountdown: 3000,
      finish: 60000,
    },
  };
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
    }, this.states.timeouts.connection);
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

  public async gameScreenLoaded(matchData: IMatcherFoundedData, socketId: string): Promise<void> {
    try {
      const rank = MMR.generateMmrToString(matchData.rank);
      const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];

      for (let i = 0; i < room.users.length; i++) {
        const user = room.users[i];

        if (user.socketId === socketId) {
          user.gameData.isLoadedScreen = true;
        }
      }

      await this.checkGamePlayable(matchData);
    } catch (e) {
      logger.error(`Game screen loaded error : ${e}`);
    }
  }

  public async checkIsUserInCompetitive(matchData: IMatcherFoundedData, email: string): Promise<void> {
    const rank: IGameLeagues = MMR.generateMmrToString(matchData.rank);
    const room = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];

    if (room) {
      const isHaveUser = room.users.filter(user => user.email === email);

      if (isHaveUser.length > 0) {
        let winnerId = '';
        for (let i = 0; i < room.users.length; i++) {
          const user = room.users[i];

          if (user.email !== email) {
            const socket = this.io.sockets.sockets.get(user.socketId);
            winnerId = user.userId;
            socket.emit('competitive:opponent-left');
          }
        }

        await this.gameFinishedForOpponentLeft(matchData, winnerId, isHaveUser[0].userId);
      }
    }
  }

  private async checkGamePlayable(matchData: IMatcherFoundedData): Promise<void> {
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];
    let gamePlayable = true;

    for (let i = 0; i < room.users.length; i++) {
      const user = room.users[i];

      if (!user.gameData.isLoadedScreen) {
        gamePlayable = false;
      }
    }

    if (gamePlayable) {
      const information: ICompetitiveGameInformations = generateCompetitiveGameInformationsObject(
        room.words,
        this.states.timeouts.startCountdown,
        this.states.timeouts.finish,
      );
      this.io.to(matchData.roomId).emit('competitive:game-informations', information);

      await this.startGameAndPreCountdown(matchData);
    }
  }

  private async startGameAndPreCountdown(matchData: IMatcherFoundedData): Promise<void> {
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];

    if (room) {
      //? Start pre countdown
      this.io.to(matchData.roomId).emit('competitive:pre-countdown-startable');

      //? When finished countdown
      setTimeout(() => {
        this.io.to(matchData.roomId).emit('competitive:game-started');
      }, this.states.timeouts.startCountdown);

      setTimeout(async () => {
        this.io.to(matchData.roomId).emit('competitive:game-ended');

        await this.gameFinished(matchData);
      }, this.states.timeouts.startCountdown + this.states.timeouts.finish);
    }
  }

  private async gameFinished(matchData: IMatcherFoundedData): Promise<void> {
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];

    if (room && !room.isGameEnded) {
      const { winnerId, loserId } = await this.getCompetitiveWinnerAndLoserId(matchData);
      const match = await this.prisma.matches.create({
        data: {
          winnerId,
          loserId,
          winnerPoint: winnerId !== '' ? await this.mmrCalculator.winnerLP(winnerId) : 0,
          loserPoint: loserId !== '' ? await this.mmrCalculator.loserLP(loserId) : 0,
          users: await this.getCompetitiveUserIds(matchData),
          matchLog: await this.getCompetitiveMatchLog(matchData),
        },
      });

      room.isGameEnded = true;
      this.io.to(matchData.roomId).emit('competitive:redirect-players', match.id);

      await this.deleteRoom(matchData);
    } else {
      logger.error('[FINISHED] : Competitive game not finished because not founding related room');
    }
  }

  private async gameFinishedForOpponentLeft(matchData: IMatcherFoundedData, winnerId: string, loserId: string): Promise<void> {
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];

    if (room && !room.isGameEnded) {
      const match = await this.prisma.matches.create({
        data: {
          winnerId,
          loserId,
          winnerPoint: winnerId !== '' ? await this.mmrCalculator.winnerLP(winnerId) : 0,
          loserPoint: loserId !== '' ? await this.mmrCalculator.loserLP(loserId) : 0,
          users: await this.getCompetitiveUserIds(matchData),
          matchLog: await this.getCompetitiveMatchLog(matchData),
        },
      });

      room.isGameEnded = true;
      this.io.to(matchData.roomId).emit('competitive:redirect-players', match.id);

      await this.deleteRoom(matchData);
    } else {
      logger.error('[FINISHED FOR OPPONENT LEFT] : Competitive game not finished because not founding related room');
    }
  }

  private async deleteRoom(matchData: IMatcherFoundedData): Promise<void> {
    const rank = MMR.generateMmrToString(matchData.rank);
    delete this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];
  }

  private async getCompetitiveWinnerAndLoserId(matchData: IMatcherFoundedData): Promise<ICompetitiveCalculateResult> {
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];
    let winnerId = '';
    let loserId = '';
    let length = room.users.length;

    while (length--) {
      const user = room.users[length];
      const prevUser = room.users[length - 1];
      if (typeof prevUser === 'undefined') break;

      if (user.gameData.stats.corrects > prevUser.gameData.stats.corrects) {
        winnerId = user.userId;
        loserId = prevUser.userId;
      } else if (user.gameData.stats.corrects === prevUser.gameData.stats.corrects) {
        if (user.gameData.stats.incorrects < prevUser.gameData.stats.incorrects) {
          winnerId = user.userId;
          loserId = prevUser.userId;
        } else if (user.gameData.stats.incorrects === user.gameData.stats.incorrects) {
          //? do nothing
        } else {
          winnerId = prevUser.userId;
          loserId = user.userId;
        }
      } else {
        winnerId = prevUser.userId;
        loserId = user.userId;
      }
    }

    return { winnerId, loserId };
  }

  private async getCompetitiveUserIds(matchData: IMatcherFoundedData): Promise<string[]> {
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];
    const userIds: string[] = [];

    if (room) {
      for (let i = 0; i < room.users.length; i++) {
        userIds.push(room.users[i].userId);
      }
    }

    return userIds;
  }

  private async getCompetitiveMatchLog(matchData: IMatcherFoundedData): Promise<object> {
    const matchLog = {};
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];

    if (room) {
      for (let i = 0; i < room.users.length; i++) {
        const user = room.users[i];

        matchLog['user' + user.userId] = user.gameData.stats;
      }
    }

    return matchLog;
  }

  public async setCorrectWord(matchData: IMatcherFoundedData, socketId: string): Promise<void> {
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];

    if (room && !room.isGameEnded) {
      let opponentId: string;
      let corrects: number;
      for (let i = 0; i < room.users.length; i++) {
        const user = room.users[i];
        if (user.socketId === socketId) {
          user.gameData.stats.corrects = user.gameData.stats.corrects + 1;
          corrects = user.gameData.stats.corrects;
        } else {
          opponentId = user.socketId;
        }
      }

      const socket = this.io.sockets.sockets.get(opponentId);
      socket.emit('competitive:update-opponent-corrects', corrects);
    }
  }

  public async setInCorrectWord(matchData: IMatcherFoundedData, socketId: string): Promise<void> {
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];

    if (room && !room.isGameEnded) {
      for (let i = 0; i < room.users.length; i++) {
        const user = room.users[i];

        if (user.socketId === socketId) {
          user.gameData.stats.incorrects = user.gameData.stats.incorrects + 1;
        }
      }
    }
  }

  public async setMistakeLetter(clientParameters: ICompetitiveMistakeClientParameters, socketId: string): Promise<void> {
    const { matchData, mistake, word } = clientParameters;
    const rank = MMR.generateMmrToString(matchData.rank);
    const room: ICompetitiveRoom = this.competitiveRooms[matchData.queueLanguage][rank][matchData.roomId];

    if (room && !room.isGameEnded) {
      for (let i = 0; i < room.users.length; i++) {
        const user = room.users[i];

        if (user.socketId === socketId) {
          if (!user.gameData.stats.mistakes[word]) {
            user.gameData.stats.mistakes[word] = [];
          }
          user.gameData.stats.mistakes[word].push({
            expectedLetter: mistake.expectedLetter,
            letterIndex: mistake.letterIndex,
            writtenLetter: mistake.writtenLetter,
          });
        }
      }
    }
  }
}
