import { Controller } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { HistoryEvent } from 'kafka';

@Controller()
export class HistoryController {
  constructor(private _historyEvent: HistoryEvent) {}

  @MessagePattern('get-all-user-brief-history.history')
  async historyGetAllBriefHistory(@Payload() message: { userId: string | number }) {
    return this._historyEvent.historyGetAllBriefHistory(message);
  }

  @MessagePattern('get-all-user-history.history')
  async historyGetAllUserHistory(@Payload() message: { userId: string | number }) {
    return this._historyEvent.historyGetAllUserHistory(message);
  }
  @MessagePattern('get-history-by-process-id.history')
  async historyGetHistoryByProcessId(@Payload() message: { processId: string }) {
    return this._historyEvent.historyGetHistoryByProcessId(message);
  }
  @MessagePattern('delete-history-by-process-id.history')
  async historyDeleteHistoryByProcessId(@Payload() message: { processId: string }) {
    return this._historyEvent.historyDeleteHistoryByProcessId(message);
  }
}
