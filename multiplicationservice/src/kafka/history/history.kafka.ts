import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka, Payload } from '@nestjs/microservices';
import { HistoryCreateType } from 'types/services.types';

@Injectable()
export class HistoryEvent {
  constructor(@Inject('HISTORY_KAFKA_PRODUCER') private readonly _historyClient: ClientKafka) {}

  async onModuleInit() {
    this._historyClient.subscribeToResponseOf('get-all-user-brief-history.history');
    this._historyClient.subscribeToResponseOf('get-all-user-history.history');
    this._historyClient.subscribeToResponseOf('get-history-by-process-id.history');
    this._historyClient.subscribeToResponseOf('delete-history-by-process-id.history');
    this._historyClient.subscribeToResponseOf('add-history.multiplication');

    await this._historyClient.connect();
  }

  async historyAddLogs(@Payload() message: { log: HistoryCreateType }) {
    return this._historyClient.send('add-history.multiplication', message);
  }

  async historyGetAllBriefHistory(@Payload() message: { userId: string | number }) {
    return this._historyClient.send('get-all-user-brief-history.history', message);
  }

  async historyGetAllUserHistory(@Payload() message: { userId: string | number }) {
    return this._historyClient.send('get-all-user-history.history', message);
  }

  async historyGetHistoryByProcessId(@Payload() message: { processId: string }) {
    return this._historyClient.send('get-history-by-process-id.history', message);
  }

  async historyDeleteHistoryByProcessId(@Payload() message: { processId: string }) {
    return this._historyClient.send('delete-history-by-process-id.history', message);
  }
}
