import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGuard } from 'auth/auth.guard';
import { HistoryRepository } from 'history/history.repository';
import { HistoryService } from 'history/history.service';
import { HttpHistoryController } from 'history/http-history.controller';
import { KafkaHistoryController } from 'history/kafka-history.controller';
import { AuthEvent } from 'kafka/auth/auth.event';
import { PrismaService } from 'prisma/prisma.service';
import { KAFKA_SERVER_URL } from 'utils/env';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'history-auth-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'auth-consumer-history',
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
  controllers: [HttpHistoryController, KafkaHistoryController],
  providers: [HistoryService, HistoryRepository, AuthGuard, AuthEvent, PrismaService],
})
export class HistoryModule {}
