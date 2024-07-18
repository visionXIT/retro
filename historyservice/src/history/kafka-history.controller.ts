import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcErrorFilter } from 'error/api-error-rpc.filter';
import { CreateHistoryDto } from './dto/create-history.dto';
import { HistoryService } from './history.service';

@UseFilters(RpcErrorFilter)
@Controller()
export class KafkaHistoryController {
  constructor(private _historyService: HistoryService) {}

  @MessagePattern('add-history.multiplication')
  public async addHistoryMultiplication(@Payload() message: { log: CreateHistoryDto }) {
    const { log } = message;

    await this._historyService.addHistory(log);
  }

  @MessagePattern('add-history.withdraw')
  public async addHistoryWithdraw(@Payload() message: { log: CreateHistoryDto }) {
    const { log } = message;

    await this._historyService.addHistory(log);
  }
}
