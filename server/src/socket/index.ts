import { logger } from '@/utils/logger';
import http from 'http';
import { SOCKET_PORT } from '@/config';
import { Server as SocketIOServer } from 'socket.io';
import CompetitiveSocket from './competitive.socket';
import CustomSocket from './custom.socket';
import { ValidateToken } from '@/utils/validateToken';

export class ServerSocket {
  private io: SocketIOServer;
  public server: http.Server;

  constructor(appServer: Express.Application) {
    this.server = http.createServer(appServer);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: ['https://keyboardsofwarriors.com', 'https://admin.keyboardsofwarriors.com', 'http://localhost:3000'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    //? Middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (typeof token !== 'undefined' && ValidateToken(token)) {
        return next();
      } else {
        return next(new Error('Authentication failed.'));
      }
    });

    //? Sockets
    new CompetitiveSocket(this.io);
    new CustomSocket(this.io);
  }

  public listen(): void {
    this.server.listen(SOCKET_PORT || 4000, () => {
      logger.info(`🚀 Socket listening on the port ${SOCKET_PORT || 4000}`);
      logger.info(`=======================================`);
    });
  }
}
