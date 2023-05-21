import { ICompetitiveRoom } from '@/interfaces/competitive.interface';
import {
  IMatchAcceptedUser,
  IMatchFounded,
  IMatchRanks,
  IMatchRejectedUser,
  IMatchRoomUser,
  IMatchStartableInformation,
} from '@/interfaces/matcher.interface';
import { User } from '@prisma/client';
import { v4 as generateId } from 'uuid';
import { generateEnglishWords } from './words.generator';

export const generateObjectForMatchRoom = (user: User, id: string): IMatchRoomUser => {
  return {
    email: user.email,
    username: user.username,
    socketId: id,
    isUserReady: false,
    isUserJoinedToRoom: false,
  };
};

export const generateObjectForQueueReadyObject = (
  rank: IMatchRanks,
  tierIndex: number,
  user: IMatchRoomUser,
  usersData: IMatchRoomUser[],
): IMatchFounded => {
  return {
    usersData: usersData,
    selfData: user,
    tierIndex,
    rank,
  };
};

export const generateObjectForRejectedUser = (rank: IMatchRanks, tierIndex: number, userData: IMatchRoomUser): IMatchRejectedUser => {
  return {
    rank,
    tierIndex,
    userData,
  };
};

export const generateObjectForAcceptedUser = (rank: IMatchRanks, tierIndex: number, userData: IMatchRoomUser): IMatchAcceptedUser => {
  return {
    rank,
    tierIndex,
    userData,
  };
};

export const generateObjectForMatchStartableInformation = (rank: IMatchRanks, tierIndex: number): IMatchStartableInformation => {
  return {
    isMatchStartable: true,
    rank,
    tierIndex,
    acceptersSocketIds: [],
    rejectersSocketIds: [],
  };
};

export const generateObjectForCompetitiveRoom = (opponents: IMatchRoomUser[]): ICompetitiveRoom => {
  return {
    isCompetitiveStarted: false,
    isCompetitiveReady: false,
    isCompetitiveEnded: false,
    words: generateEnglishWords(),
    competitiveId: generateId(),
    opponents,
  };
};
