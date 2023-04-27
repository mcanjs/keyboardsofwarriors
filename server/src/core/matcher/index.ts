interface IMatcher {
  [key: string]: {
    users: {
      [key: string]: boolean;
    };
    databaseMatchInformationsCreated?: boolean;
    isMatchStarted: boolean;
    readyUsers: {
      [key: string]: boolean;
    };
  };
}

export default class Matcher {
  public matches: IMatcher;
  private initialRoom = {
    users: {},
    readyUsers: {},
    isMatchStarted: false,
  };
  constructor() {
    this.matches = {};
  }

  /*
    'room1': {
      'user1-id': boolean,
      'user2-id': boolean
    }
    matches['room1']['user1-id']
  */

  public checkIsMatchStarted(roomId: string): boolean {
    if (roomId && this.matches[roomId] && this.matches[roomId].isMatchStarted) return true;
    return false;
  }

  public changeIsMatchStarted(roomId: string): boolean {
    if (roomId && this.matches[roomId]) {
      this.matches[roomId].isMatchStarted = true;
      return true;
    }
    return false;
  }

  public createDatabaseInformations(roomId: string): boolean {
    if (roomId && this.matches[roomId] && !this.matches[roomId].databaseMatchInformationsCreated) {
      this.matches[roomId].databaseMatchInformationsCreated = true;
      return true;
    }
    return false;
  }

  public checkCreatedDatabaseInformations(roomId: string): boolean {
    if (roomId && this.matches[roomId] && !this.matches[roomId].databaseMatchInformationsCreated) {
      return false;
    }
    return true;
  }

  public setUserReady(roomId: string, userId: string): boolean {
    if (roomId && this.matches[roomId]) {
      this.matches[roomId].readyUsers[userId] = true;
      return true;
    }
    return false;
  }

  public checkIsUsersReady(roomId: string): boolean {
    if (roomId && this.matches[roomId] && Object.keys(this.matches[roomId].readyUsers).length === 2) {
      return true;
    }
    return false;
  }

  public createRoom(firstOpponent: string, secondOpponent: string): string {
    const variations: string[] = [firstOpponent + secondOpponent, secondOpponent + firstOpponent];
    if (this.matches[variations[0]]) {
      return variations[0];
    } else if (this.matches[variations[1]]) {
      return variations[1];
    } else {
      this.matches[variations[0]] = this.initialRoom;
      return variations[0];
    }
  }

  public removeRoom(roomId: string): boolean {
    if (this.matches[roomId]) {
      delete this.matches[roomId];
    }
    return false;
  }

  public addUser(roomId: string, userId: string): boolean {
    if (this.matches[roomId]) {
      this.matches[roomId].users[userId] = true;
      return true;
    }
    return false;
  }

  public isMatchStartable(roomId: string): boolean {
    if (roomId && this.matches[roomId] && Object.keys(this.matches[roomId].users).length === 2) {
      return true;
    }
    return false;
  }

  public foundAcceptedMatch(roomId: string): string {
    if (roomId && this.matches[roomId] && Object.keys(this.matches[roomId].users).length !== 0) {
      return Object.keys(this.matches[roomId].users)[0];
    }
    return '';
  }
}
