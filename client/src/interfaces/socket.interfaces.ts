export type ISocketMatchRanks =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandMaster'
  | 'challenger';

export interface ISocketMatchWatingUserData {
  tierIndex: number;
  rank: ISocketMatchRanks;
}
