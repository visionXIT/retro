import { Body, Injectable } from '@nestjs/common';
import { Client, ClientKafka, Transport } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { EmailMessageType } from 'types/types';
import { KAFKA_SERVER_URL } from 'utils/env';

@Injectable()
export class SenderEvent {
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'auth-producer',
        brokers: [KAFKA_SERVER_URL],
      },
      consumer: {
        groupId: 'mail-sender-consumer',
      },
      run: {
        autoCommit: true,
      },
    },
  })
  private _client: ClientKafka;

  async onModuleInit() {
    await this._client.connect();
  }

  async sendMessageOnEmail(
    @Body()
    message: EmailMessageType,
  ): Promise<void> {
    this._client.emit('send-email.sender', message);
  }
}
