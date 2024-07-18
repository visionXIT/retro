import { Observable } from 'rxjs';
import { Payload, ClientKafka } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { LoggerType, PaymentStatusData } from 'types/types';

@Injectable()
export class LoggerEvent {
  private _loggerList: PaymentStatusData[] = [];

  constructor(@Inject('LOGGER_KAFKA_PRODUCER') private readonly _loggerClient: ClientKafka) {}

  async onModuleInit() {
    await this._loggerClient.connect();
  }

  /**
   * Adds a log to the log list and emits it to the socket.
   * @param {LoggerType} log - The log to be added.
   * @returns {void}
   */
  async addLogInLogList(@Payload() log: PaymentStatusData): Promise<void> {
    this._loggerList.push(log);
    this._loggerClient.emit('logger-process.payment', log);
  }

  removeLogList() {
    this._loggerList = [];
  }

  getLogsList(paymentId: number) {
    return this._loggerList.filter((log: PaymentStatusData) => log.payment_id === paymentId);
  }
}
