import { ICompetitiveCreating, ICompetitiveRoom, ICompetitiveRooms } from '@/interfaces/competitive.interface';
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

  public setUserReady(rank: IMatchRanks, competitiveTierIndex: number, socketId: string): { willBeNotifySocketId: string } {
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

  public checkIsUsersReady(rank: IMatchRanks, competitiveTierIndex: number): { socketIds: string[]; isUsersReady: boolean; words: string[] } {
    const competitiveRoom = this.competitiveRooms[rank as IMatchRanks][competitiveTierIndex as number];
    const opponents = competitiveRoom.opponents;
    const socketIds = [];
    let isUsersReady = true;

    for (let i = 0; i < opponents.length; i++) {
      if (!opponents[i].isUserReady) {
        isUsersReady = false;
      } else {
        socketIds.push(opponents[i].socketId);
      }
    }

    return { socketIds, isUsersReady, words: competitiveRoom.words };
  }
}
