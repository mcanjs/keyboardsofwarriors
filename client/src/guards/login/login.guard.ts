import { eraseCookie, getCookie, setCookie } from "@/src/utils/helper";

export default class LoginGuard {
  public states = {
    request: {
      limit: 5,
      banMinute: 5,
    },
    cookie: {
      names: {
        limit: "kowg-mll",
        minute: "kowg-mllrfb",
      },
    },
  };

  private checkLoginCookie(): string | null {
    return getCookie(this.states.cookie.names.limit);
  }

  public async refreshCookie(): Promise<void> {
    eraseCookie(this.states.cookie.names.limit);
    eraseCookie(this.states.cookie.names.minute);
  }

  private async ban(): Promise<void> {
    const now = new Date();
    const banMinute = now.setMinutes(
      now.getMinutes() + this.states.request.banMinute
    );
    setCookie(this.states.cookie.names.minute, banMinute);
  }

  public async checkHaveEntryRights(): Promise<boolean> {
    const cookie = this.checkLoginCookie() ?? "0";
    const reqCount = parseInt(cookie);

    if (reqCount && reqCount >= this.states.request.limit) {
      const leftSeconds = this.getLeftBanSeconds();

      if (leftSeconds <= 0) {
        await this.refreshCookie();
        return true;
      }

      return false;
    }

    return true;
  }

  public async getHaveEntryRights(): Promise<number> {
    const cookie = this.checkLoginCookie() ?? "0";
    const reqCount = parseInt(cookie);

    return reqCount
      ? this.states.request.limit - reqCount
      : this.states.request.limit;
  }

  public getLeftBanSeconds(): number {
    const banTime = getCookie(this.states.cookie.names.minute);

    if (banTime) {
      const ban = new Date(parseInt(banTime));
      const now = new Date();
      const diffSecond = Math.floor((ban.getTime() - now.getTime()) / 1000);

      return diffSecond;
    }

    return 0;
  }

  public async checkAvailabilty(): Promise<boolean> {
    const cookie = this.checkLoginCookie();

    if (cookie) {
      const nextReqCount = parseInt(cookie) + 1;
      setCookie(this.states.cookie.names.limit, nextReqCount);

      if (nextReqCount >= this.states.request.limit) {
        await this.ban();
        return false;
      }

      return await this.checkHaveEntryRights();
    } else {
      setCookie(this.states.cookie.names.limit, 1);
    }

    return true;
  }
}
