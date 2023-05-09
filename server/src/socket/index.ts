import Matcher from '@/core/matcher';
import { PrismaClient } from '@prisma/client';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

export class ServerSocket {
  private io: SocketIOServer;
  public server: http.Server;
  public queIds: string[] = [];
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

  private connection() {
    this.io.on('connection', socket => {
      const email = socket.handshake.query.email;
      console.log('One user connected: ', email);
      socket.on('disconnect', async () => {
        console.log('disconnected');
      });
    });
  }

  public listen() {
    this.server.listen(4000, () => {
      console.log(`Server listening on port ${4000}`);
    });
  }
}
