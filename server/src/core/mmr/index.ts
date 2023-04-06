// Matchmaking Rank

export default class MMR {
  private isEloHell = false;

  private calcWrongChar(): void {
    console.log('X');
  }

  private calcWrongWord(): void {
    console.log('X');
  }

  public static calcWinMMR(): number {
    return 10;
  }
  public static calcLoseMMR(): number {
    return -10;
  }
}
