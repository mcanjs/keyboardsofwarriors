import { IMatchRanks, IMatchRoomUsers, IMatchRooms, IMatchWatingUser } from '@/interfaces/matcher.interface';
import MMR from '../mmr';
import { User } from '@prisma/client';

export default class Matcher {
  public matchRooms: IMatchRooms;
  constructor() {
    this.matchRooms = {
      bronze: [],
      silver: [],
      gold: [],
      platinum: [],
      diamond: [],
      master: [],
      grandMaster: [],
      challenger: [],
    };
  }

  public checkMatchRoomForNewQueue(mmr: number, user: IMatchRoomUsers): IMatchRoomUsers[] | IMatchWatingUser {
    const rank: IMatchRanks = MMR.generateMmrToString(mmr);

    const tier = this.matchRooms[rank];
    for (let i = 0; i < tier.length; i++) {
      if (tier[i].length < 2) {
        //? If the created room with the same MMR was found
        this.addUserForCreatedRoom(rank, i, user);
        //? Check is queue ready for 2 opponents
        const isQueueReady: string = this.checkIsQueueReady(rank, i, user);
        if (isQueueReady === 'ready') {
          //? Get user infos
          return this.getUsersData(rank, i);
        } else if (isQueueReady === 'reached') {
          //? Force leave for room joined to much user
          this.forceLeaveToRoomUserForReachedUser(rank, i, user);
          //? Return find a match
          return this.checkMatchRoomForNewQueue(mmr, user);
        }
      }
    }

    //? If the created room with the same MMR was not found
    const waitingUserData: IMatchWatingUser = this.createMatchRoom(rank, user);
    return waitingUserData;
  }

  private getUsersData(rank: IMatchRanks, tierIndex: number): IMatchRoomUsers[] {
    return this.matchRooms[rank][tierIndex];
  }

  private forceLeaveToRoomUserForReachedUser(rank: IMatchRanks, tierIndex: number, user: IMatchRoomUsers): void {
    let userIndex = -1;
    for (let i = 0; i < this.matchRooms[rank][tierIndex].length; i++) {
      const perUser = this.matchRooms[rank][tierIndex][i];

      if (perUser.email === user.email) {
        userIndex = i;
      }
    }

    if (userIndex > -1) {
      const room = this.matchRooms[rank][tierIndex];
      room.splice(userIndex, 1);
    }
  }

  private checkIsQueueReady(rank: IMatchRanks, tierIndex: number, user: IMatchRoomUsers): string {
    if (this.matchRooms[rank][tierIndex].length === 2) {
      return 'ready';
    } else if (this.matchRooms[rank][tierIndex].length > 2) {
      return 'reached';
    }
    return 'notReady';
  }

  private addUserForCreatedRoom(rank: IMatchRanks, tierIndex: number, user: IMatchRoomUsers): void {
    this.matchRooms[rank][tierIndex].push(user);
  }

  private createMatchRoom(rank: IMatchRanks, user: IMatchRoomUsers): IMatchWatingUser {
    this.matchRooms[rank].push([user]);
    return { tierIndex: this.matchRooms[rank].length - 1, rank };
  }

  public removeMatchRoom(rank: IMatchRanks, tierIndex: number) {
    if (this.matchRooms[rank][tierIndex].length < 2) {
      //? If in room only one user
      this.matchRooms[rank].splice(tierIndex, 1);
    }
  }
}
