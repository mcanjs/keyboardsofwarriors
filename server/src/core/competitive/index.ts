import {
  ICompetitiveCheckUserReady,
  ICompetitiveCreating,
  ICompetitiveGetOpponent,
  ICompetitiveRoom,
  ICompetitiveRooms,
  ICompetitiveSetUserReady,
} from '@/interfaces/competitive.interface';
import { IMatchRanks } from '@/interfaces/matcher.interface';

export default class Competitive {
  private competitiveRooms: ICompetitiveRooms;
  constructor() {
    this.competitiveRooms = {
      bronze: [],
      silver: [],
      gold: [],
      platinum: [],
      diamond: [],
      grandMaster: [],
      challenger: [],
    };
  }

  public async createCompetitiveRoom(rank: IMatchRanks, roomData: ICompetitiveRoom): Promise<ICompetitiveCreating> {
    this.competitiveRooms[rank].push(roomData);
    return { competitiveTierIndex: this.competitiveRooms[rank].length - 1, rank, roomData };
  }

  public setUserReady(rank: IMatchRanks, competitiveTierIndex: number, socketId: string): ICompetitiveSetUserReady {
    const opponents = this.competitiveRooms[rank][competitiveTierIndex].opponents;
    let willBeNotifySocketId = '';

    for (let i = 0; i < opponents.length; i++) {
      if (opponents[i].socketId === socketId) {
        opponents[i].isUserReady = true;
      } else {
        willBeNotifySocketId = socketId;
      }
    }

    return { willBeNotifySocketId };
  }

  public checkIsUsersReady(rank: IMatchRanks, competitiveTierIndex: number, socketId: string): ICompetitiveCheckUserReady {
    const competitiveRoom = this.competitiveRooms[rank as IMatchRanks][competitiveTierIndex as number];
    const opponents = competitiveRoom.opponents;
    const socketIds = [];
    let opponentSocketId = '';
    let isUsersReady = true;

    for (let i = 0; i < opponents.length; i++) {
      if (socketId !== opponents[i].socketId) {
        opponentSocketId = opponents[i].socketId;
      }
      if (!opponents[i].isUserReady) {
        isUsersReady = false;
      } else {
        socketIds.push(opponents[i].socketId);
      }
    }

    return { socketIds, isUsersReady, words: competitiveRoom.words, opponentSocketId };
  }

  public getOpponent(userEmail: string, rank: IMatchRanks, competitiveTierIndex: number): ICompetitiveGetOpponent | undefined {
    const competitiveRoom = this.competitiveRooms[rank][competitiveTierIndex];
    const opponents = competitiveRoom && competitiveRoom.opponents;

    for (let i = 0; i < opponents.length; i++) {
      if (opponents[i].email !== userEmail) {
        return { socketId: opponents[i].socketId, email: opponents[i].email };
      }
    }

    return undefined;
  }
}
