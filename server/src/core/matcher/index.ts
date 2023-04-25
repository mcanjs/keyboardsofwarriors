interface IMatcher {
  [key: string]: {
    users: {
      [key: string]: boolean;
    };
    databaseMatchInformationsCreated?: boolean;
  };
}

export default class Matcher {
  public matches: IMatcher;
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

  public createRoom(firstOpponent: string, secondOpponent: string): string {
    const variations: string[] = [firstOpponent + secondOpponent, secondOpponent + firstOpponent];
    if (this.matches[variations[0]]) {
      return variations[0];
    } else if (this.matches[variations[1]]) {
      return variations[1];
    } else {
      this.matches[variations[0]] = { users: {} };
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
    if (this.matches[roomId]) {
      const room = this.matches[roomId];
      if (room.users && Object.keys(room.users).length === 2) {
        return true;
      }
    }
    return false;
  }

  public foundAcceptedMatch(roomId: string): string {
    if (this.matches[roomId]) {
      const room = this.matches[roomId];
      if (Object.keys(room).length !== 0) {
        return Object.keys(room)[0];
      }
    }
    return '';
  }
}
