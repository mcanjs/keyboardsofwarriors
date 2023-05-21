import {
  IMatchAcceptedUser,
  IMatchFounded,
  IMatchRanks,
  IMatchRejectedUser,
  IMatchRoomUser,
  IMatchRooms,
  IMatchStartableInformation,
  IMatchWaitingUser,
} from '@/interfaces/matcher.interface';
import MMR from '../mmr';
import { generateObjectForMatchStartableInformation, generateObjectForQueueReadyObject } from '../generators/object.generator';

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

  public checkMatchRoomForNewQueue(mmr: number, user: IMatchRoomUser): IMatchFounded | IMatchWaitingUser {
    const rank: IMatchRanks = MMR.generateMmrToString(mmr);
    const tier = this.matchRooms[rank];
    for (let i = 0; i < tier.length; i++) {
      if (tier[i].length < 2) {
        //? If the created room with the same MMR was found
        this.addUserForCreatedRoom(rank, i, user);
        //? Check is queue ready for 2 opponents
        const isQueueReady: string = this.checkIsQueueReady(rank, i);
        if (isQueueReady === 'ready') {
          //? Get user infos
          return generateObjectForQueueReadyObject(rank, i, user, this.matchRooms[rank][i]);
        } else if (isQueueReady === 'reached') {
          //? Force leave for room joined to much user
          this.forceLeaveToRoomUserForReachedUser(rank, i, user);
          //? Return find a match
          return this.checkMatchRoomForNewQueue(mmr, user);
        }
      }
    }

    //? If the created room with the same MMR was not found
    const waitingUserData: IMatchWaitingUser = this.createMatchRoom(rank, user);
    return waitingUserData;
  }

  private forceLeaveToRoomUserForReachedUser(rank: IMatchRanks, tierIndex: number, user: IMatchRoomUser): void {
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

  private checkIsQueueReady(rank: IMatchRanks, tierIndex: number): string {
    if (this.matchRooms[rank][tierIndex].length === 2) {
      return 'ready';
    } else if (this.matchRooms[rank][tierIndex].length > 2) {
      return 'reached';
    }
    return 'notReady';
  }

  private addUserForCreatedRoom(rank: IMatchRanks, tierIndex: number, user: IMatchRoomUser): void {
    this.matchRooms[rank][tierIndex].push(user);
  }

  private createMatchRoom(rank: IMatchRanks, user: IMatchRoomUser): IMatchWaitingUser {
    this.matchRooms[rank].push([user]);
    return { tierIndex: this.matchRooms[rank].length - 1, rank };
  }

  public removeMatchRoom(rank: IMatchRanks, tierIndex: number) {
    if (this.matchRooms[rank][tierIndex].length < 2) {
      //? If in room only one user
      this.matchRooms[rank].splice(tierIndex, 1);
    }
  }

  public checkIsMatchStartable(rank: IMatchRanks, tierIndex: number): IMatchStartableInformation {
    const startableInformation: IMatchStartableInformation = generateObjectForMatchStartableInformation(rank, tierIndex);
    const relatedRooms = this.matchRooms[rank][tierIndex];

    for (let i = 0; i < relatedRooms.length; i++) {
      const user = relatedRooms[i];
      if (!user.isUserReady) {
        startableInformation.isMatchStartable = false;
        startableInformation.rejectersSocketIds.push(user.socketId);
      } else {
        startableInformation.acceptersSocketIds.push(user.socketId);
      }
    }

    return startableInformation;
  }

  public async userAcceptedMatch(acceptedUserData: IMatchAcceptedUser): Promise<void> {
    const { rank, tierIndex, userData } = acceptedUserData;
    const relatedRoom = this.matchRooms[rank][tierIndex];
    for (let i = 0; i < relatedRoom.length; i++) {
      if (relatedRoom[i].socketId === userData.socketId) {
        relatedRoom[i].isUserReady = true;
      }
    }
  }

  public async terminateMatchWasRejected(rejectedUserData: IMatchRejectedUser): Promise<void> {
    const { rank, tierIndex, userData } = rejectedUserData;
    const relatedRoom = this.matchRooms[rank][tierIndex];
    for (let i = 0; i < relatedRoom.length; i++) {
      if (relatedRoom[i].email === userData.email) {
        relatedRoom.splice(i, 1);
      } else {
        //? Accepted user continue in queue for this refresh states...
        relatedRoom[i].isUserReady = false;
      }
    }
  }

  public async kickDisconnectedUser(mmr: number, tierIndex: number, email: string): Promise<void> {
    if (typeof mmr !== 'number' || typeof tierIndex !== 'number' || typeof email !== 'string') return console.log('mmr f');
    const rank: IMatchRanks = MMR.generateMmrToString(mmr);
    const users = this.matchRooms[rank] && this.matchRooms[rank][tierIndex];

    if (users) {
      for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) {
          this.matchRooms[rank][tierIndex].splice(i, 1);
        }
      }
    }

    //? If room in empty

    if (this.matchRooms[rank][tierIndex] && this.matchRooms[rank][tierIndex].length === 0) {
      this.matchRooms[rank].splice(tierIndex, 1);
    }
  }

  public getRoomUsersForCreating(rank: IMatchRanks, tierIndex: number): IMatchRoomUser[] {
    return this.matchRooms[rank][tierIndex];
  }
}
