import Matcher from '@/core/matcher';
import { IMatchRoomUsers, IMatchWatingUser } from '@/interfaces/matcher.interface';
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
    };
  }

  private matchFounded(users: IMatchRoomUsers[]): void {
    for (let i = 0; i < users.length; i++) {
      this.io.to(users[i].socketId).emit('match:founded');
    }
  }

  private async queueStart(socket: Socket, email: string): Promise<void> {
    const user = await this.getUserData(email);
    //? Queue started
    this.addQueueId(socket.id);

    //? Found match for new queue
    const result: IMatchWatingUser | IMatchRoomUsers[] = this.matcher.checkMatchRoomForNewQueue(
      user.rank,
      this.generateObjectForMatchRoom(user, socket.id),
    );
    if ('tierIndex' in result) {
      socket.emit('queue:waitingUserData', result);
    } else if (result.length > 0) {
      this.matchFounded(result);
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
