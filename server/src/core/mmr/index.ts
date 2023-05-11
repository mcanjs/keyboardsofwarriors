// Matchmaking Rank

import { IMatchRanks } from '@/interfaces/matcher.interface';

export default class MMR {
  public static generateMmrToString(mmr: number): IMatchRanks {
    if (mmr > -1 && mmr < 200) {
      return 'bronze';
    } else if (mmr >= 200 && mmr < 400) {
      return 'silver';
    } else if (mmr >= 400 && mmr < 600) {
      return 'gold';
    } else if (mmr >= 600 && mmr < 800) {
      return 'platinum';
    } else if (mmr >= 800 && mmr < 1000) {
      return 'diamond';
    } else if (mmr >= 1000 && mmr < 1200) {
      return 'grandMaster';
    }
    return 'challenger';
  }
}
