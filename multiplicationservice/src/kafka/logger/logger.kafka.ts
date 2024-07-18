import { Observable } from 'rxjs';
import { Payload, ClientKafka } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { LoggerType } from 'types/services.types';

@Injectable()
export class LoggerEvent {
  private _loggerList: LoggerType[] = [];

  constructor(@Inject('LOGGER_KAFKA_PRODUCER') private readonly _loggerClient: ClientKafka) {}

  async onModuleInit() {
    await this._loggerClient.connect();
  }

  /**
   * Adds a log to the log list and emits it to the socket.
   * @param {LoggerType} log - The log to be added.
   * @returns {void}
   */
  async addLogInLogList(@Payload() log: LoggerType, idProcess: string, userId: number): Promise<void> {
    this._loggerList.push(log);
    this._loggerClient.emit('logger-process.multiplication', this.getLogsList(idProcess, userId));
  }

  removeLogList(processId: string) {
    this._loggerList = this._loggerList.filter((log) => log.idProcess !== processId);
  }

  getLogsList(idProcess: string, userId: number) {
    return this._loggerList.filter((log: LoggerType) => log.idProcess === idProcess && log.userId === userId);
  }
}
