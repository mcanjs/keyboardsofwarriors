import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export class ServerSocket {
  private io: SocketIOServer;
  public server: http.Server;
  public queCounter = 0;
  public queIds: string[] = [];
  constructor(appServer: Express.Application) {
    this.server = http.createServer(appServer);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: '*',
      },
    });

    this.connection();
  }

  private deleteQueId(id: string): void {
    if (this.queIds.indexOf(id) > -1) {
      this.queIds.splice(this.queIds.indexOf(id), 1);
    }
  }

  private startQue(socket: Socket): void {
    socket.on('started-queue', () => {
      this.queCounter += 1;
      this.queIds.push(socket.id);
      this.io.emit('que-counter', this.queCounter);
    });
  }

  private stopQue(socket: Socket): void {
    socket.on('stop-queue', () => {
      this.queCounter -= 1;
      this.deleteQueId(socket.id);
      this.io.emit('que-counter', this.queCounter);
    });
  }

  private connection() {
    this.io.on('connection', socket => {
      console.log('One user connected:', socket.id);
      //
      socket.on('disconnect', () => {
        if (this.queIds.indexOf(socket.id) > -1) {
          this.queCounter -= 1;
          this.io.emit('que-counter', this.queCounter);
        }
      });

      //* Start Que
      this.startQue(socket);

      //* Stop Que
      this.stopQue(socket);
    });
  }
  public listen() {
    this.server.listen(4000, () => {
      console.log(`Server listening on port ${4000}`);
    });
  }
}
