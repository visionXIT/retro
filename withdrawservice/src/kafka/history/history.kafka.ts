import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka, Payload } from '@nestjs/microservices';
import { HistoryCreateType } from 'types/types';

@Injectable()
export class HistoryEvent {
  constructor(@Inject('HISTORY_KAFKA_PRODUCER') private readonly _historyClient: ClientKafka) {}

  async onModuleInit() {
    this._historyClient.subscribeToResponseOf('add-history.withdraw');
    await this._historyClient.connect();
  }

  async historyAddLogs(@Payload() message: { log: HistoryCreateType }) {
    return this._historyClient.send('add-history.withdraw', message);
  }
}
