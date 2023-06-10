import { PrismaClient } from '@prisma/client';
import http from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';

export class ServerSocket {
  private io: SocketIOServer;
  public server: http.Server;
  public queueIds: string[] = [];
  public inPlayingPlayers = 0;
  public matchedUsers: { [key: string]: boolean } = {};
  public prisma = new PrismaClient();
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

  private connection() {
    this.io.on('connection', socket => {
      const email = socket.handshake.query.email;
      console.log('One user connected: ', email);

      socket.on('disconnect', async () => {
        console.log('One user disconnected: ', email);
        this.removeQueueId(socket.id);
      });
    });
  }

  public listen() {
    this.server.listen(4000, () => {
      console.log(`Server listening on port ${4000}`);
    });
  }
}
