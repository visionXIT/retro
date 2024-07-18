import { Controller } from '@nestjs/common';
import { Payload, EventPattern } from '@nestjs/microservices';
import { SocketGateway } from 'socket/socket.gateway';
// import { SocketService } from 'socket/socket.service';
import { LoggerPaymentType, LoggerType } from 'types/types';

@Controller()
export class LoggerController {
  logs: LoggerType[] = [];

  constructor(private _socket: SocketGateway) {}

  @EventPattern('logger-process.multiplication')
  addNewLog(@Payload() message: LoggerType[]) {
    if (!message.length) {
      return;
    }
    console.log(message);
    const userId = this._socket.userId;
    console.log('userId => ', userId);
    this._socket.sendMessageToRoom(
      `room-${userId}`,
      'message.multiplication',
      JSON.stringify(message),
    );
    // this._socket.sendMessage(JSON.stringify(message));
  }

  @EventPattern('logger-process.payment')
  addNewLogPayment(@Payload() message: LoggerPaymentType) {
    if (!message) {
      return;
    }
    const { userId } = JSON.parse(message.order_description);
    // this._socket.sendMessageToUser(userId, JSON.stringify(message));
    this._socket.sendMessageToRoom(
      `room-${userId}`,
      'message.payment',
      JSON.stringify(message),
    );
  }
}
