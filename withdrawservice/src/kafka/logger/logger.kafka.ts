import { Observable } from 'rxjs';
import { Payload, ClientKafka } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { LoggerType } from 'types/types';

@Injectable()
export class LoggerEvent {
  logs: LoggerType[] = [];
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
    this.logs.push(log);
    const logsList = this.getLogsLost(idProcess, userId);
    this._loggerClient.emit('logger-process.multiplication', logsList);
  }

  getLogsLost(idProcess: string, userId: number) {
    return this.logs.filter((log) => log.idProcess === idProcess && log.userId === userId);
  }
}
