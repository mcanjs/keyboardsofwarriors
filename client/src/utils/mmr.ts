import { IGameLeagues } from '../interfaces/socket/game.interface';

export default class MMR {
  public static generateMmrToString(mmr: number): IGameLeagues {
    if (mmr < 200) {
      return 'bronze';
    } else if (mmr >= 200 && mmr < 400) {
      return 'silver';
    } else if (mmr >= 400 && mmr < 600) {
      return 'gold';
    } else if (mmr >= 600 && mmr < 800) {
      return 'platinum';
    } else if (mmr >= 800 && mmr < 1000) {
      return 'diamond';
    }

    return 'legend';
  }
}
