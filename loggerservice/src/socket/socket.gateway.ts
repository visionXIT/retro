import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AuthGuard } from 'auth/auth-socket.guard';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class SocketGateway {
  constructor(private _authGuard: AuthGuard) {}

  @WebSocketServer()
  server: Server;
  userId: number;

  async handleConnection(client: Socket) {
    const userId = await this._authGuard.checkUserAuth(client);
    console.log(`Client connected: ${client.id}`, `room-${userId}`);
    client.join(`room-${userId}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  sendMessageToRoom(room: string, eventName: string, message: string) {
    this.server.to(room).emit(eventName, message);
  }
}
