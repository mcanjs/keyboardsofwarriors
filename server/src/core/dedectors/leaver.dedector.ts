export default class LeaverDedector {
  constructor() {
    //?
  }
  public async createBanDate(): Promise<string> {
    const date = new Date();
    return new Date(date.getTime() + 1 * 60000).toUTCString();
  }

  public async checkIsHaveBan(banDate: string): Promise<boolean> {
    const now = new Date();
    console.log(now, new Date(banDate));
    return !(now > new Date(banDate));
  }
}
