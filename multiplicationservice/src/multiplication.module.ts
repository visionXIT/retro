import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HistoryEvent, LoggerEvent, SubscribeEvent } from 'kafka';
import { HistoryController, SubscribeController } from 'controllers';
import { MultiplicationController, MultiplicatorService } from 'multiplication';
import { KAFKA_SERVER_URL } from 'utils/env';
import { MultiplicationRepository } from 'multiplication/multiplication.repository';
import { AuthEvent } from 'kafka/auth/auth.event';
import { AuthGuard } from 'auth/auth.guard';
import { PrismaService } from 'prisma/prisma.service';
import { AuthMiddleware } from 'middleware/auth.middleware';
import { LoggerMiddleware } from 'middleware/logging.middleware';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'multiplicator-auth-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'multiplicator-auth-consumer',
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
            clientId: 'multiplicator-logger-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'multiplicator-logger-consumer',
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
            clientId: 'multiplicator-history-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'multiplicator-history-consumer',
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
        name: 'SUBSCRIBE_KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'multiplicator-subscribe-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'multiplicator-subscribe-consumer',
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
  controllers: [MultiplicationController, SubscribeController, HistoryController],
  providers: [
    MultiplicatorService,
    SubscribeEvent,
    LoggerEvent,
    HistoryEvent,
    MultiplicationRepository,
    AuthEvent,
    AuthGuard,
    PrismaService,
  ],
})
export class MultiplicationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
