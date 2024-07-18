import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HistoryEvent } from 'kafka/history/history.kafka';
import { LoggerEvent } from 'kafka/logger/logger.kafka';
import { KAFKA_SERVER_URL } from 'utils/env';
import { OkxService } from 'withdraw/okx-withdraw';
import { WithdrawController } from 'withdraw/withdraw.controller';
import { WithdrawRepository } from 'withdraw/withdraw.repository';
import { WithdrawService } from 'withdraw/withdraw.service';
import { PrismaService } from 'prisma/prisma.service';
import { AuthEvent } from 'kafka/auth/auth.event';
import { AuthGuard } from 'auth/auth.guard';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'withdraw-auth-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'withdraw-auth-consumer',
          },
          producer: {
            allowAutoTopicCreation: true,
          },
          run: {
            autoCommit: true,
          },
        },
      },
      {
        name: 'LOGGER_KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'withdraw-logger-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'withdraw-consumer',
          },
          producer: {
            allowAutoTopicCreation: true,
          },
          run: {
            autoCommit: true,
          },
        },
      },
      {
        name: 'HISTORY_KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'withdraw-history-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'withdraw-consumer',
          },
          producer: {
            allowAutoTopicCreation: true,
          },
          run: {
            autoCommit: true,
          },
        },
      },
    ]),
  ],
  controllers: [WithdrawController],
  providers: [WithdrawService, OkxService, WithdrawRepository, LoggerEvent, HistoryEvent, PrismaService, AuthEvent, AuthGuard],
})
export class WithdrawModule {}
