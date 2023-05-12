import Matcher from '@/core/matcher';
import { IMatchFounded, IMatchRoomUsers, IMatchWatingUser } from '@/interfaces/matcher.interface';
import { PrismaClient, User } from '@prisma/client';
import http from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';

export class ServerSocket {
  private io: SocketIOServer;
  public server: http.Server;
  public queueIds: string[] = [];
  public inPlayingPlayers = 0;
  public matchedUsers: { [key: string]: boolean } = {};
  public prisma = new PrismaClient();
  public matcher = new Matcher();
  constructor(appServer: Express.Application) {
    this.server = http.createServer(appServer);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
      },
    });

    this.connection();
  }

  private addQueueId(id: string): void {
    if (this.queueIds.indexOf(id) < 0) {
      this.queueIds.push(id);
    }
  }

  private removeQueueId(id: string): void {
    const index = this.queueIds.indexOf(id);
    if (index > -1) {
      this.queueIds.splice(index, 1);
    }
  }

  private async getUserData(email: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  private generateObjectForMatchRoom(user: User, id: string): IMatchRoomUsers {
    return {
      email: user.email,
      username: user.username,
      socketId: id,
      isUserReady: false,
    };
  }

  private matchFounded(result: IMatchFounded, socketId: string): void {
    const users = result.usersData;
    for (let i = 0; i < users.length; i++) {
      if (users[i].socketId === socketId) {
        console.log('userrr>>', users[i]);
        result.selfData = users[i];
      }
      this.io.to(users[i].socketId).emit('match:founded', result);
    }

    setTimeout(() => {
      // todo
      //? Check is match startable
    }, 10005);
  }

  private async queueStart(socket: Socket, email: string): Promise<void> {
    const user = await this.getUserData(email);
    //? Queue started
    this.addQueueId(socket.id);

    //? Found match for new queue
    //! BUG: Her zaman son queue onaylayan kullanıcı geliyor!
    const result: IMatchWatingUser | IMatchFounded = this.matcher.checkMatchRoomForNewQueue(
      user.rank,
      this.generateObjectForMatchRoom(user, socket.id),
    );
    if ('usersData' in result) {
      this.matchFounded(result, socket.id);
    } else if ('rank' in result) {
      socket.emit('queue:waitingUserData', result);
    }
  }

  private queueLeave(socket: Socket, data: IMatchWatingUser | undefined): void {
    //? Left from queue
    this.removeQueueId(socket.id);
    //? Delete Match Room for user left from queue
    if (data) {
      //? If user leaving and when not founded match remove match room
      this.matcher.removeMatchRoom(data.rank, data.tierIndex);
    }
  }

  private matchAccepted(socket: Socket, data: IMatchFounded): void {
    //?
    console.log('accepted match: ', data.selfData.email);
  }

  private matchRejected(socket: Socket, data: IMatchFounded): void {
    console.log('rejected match: ', data.selfData.email);
  }

  private connection() {
    this.io.on('connection', socket => {
      const email = socket.handshake.query.email;
      console.log('One user connected: ', email);

      socket.on('disconnect', async () => {
        console.log('One user disconnected: ', email);
        this.removeQueueId(socket.id);
      });

      //? Queue Started Event
      socket.on('queue:start', this.queueStart.bind(this, socket, email));

      //? Queue Leave Event
      socket.on('queue:leave', this.queueLeave.bind(this, socket));

      //? Match Accepted Event
      socket.on('match:accepted', this.matchAccepted.bind(this, socket));

      //? Match Rejected Event
      socket.on('match:rejected', this.matchRejected.bind(this, socket));

      //? Match Room logs
      socket.on('logs:matchRooms', () => socket.emit('logs:matchRooms', this.matcher.matchRooms));
    });
  }

  public listen() {
    this.server.listen(4000, () => {
      console.log(`Server listening on port ${4000}`);
    });
  }
}
