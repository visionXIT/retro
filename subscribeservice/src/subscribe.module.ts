import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGuard } from 'auth/auth.guard';
import { AuthEvent } from 'kafka/auth/auth.event';
import { PrismaService } from 'prisma/prisma.service';
import { HttpSubscribeController } from 'subscribe/http-subscribe.controller';
import { KafkaSubscribeController } from 'subscribe/kafka-subscribe.controller';
import { SubscribeRepository } from 'subscribe/subscribe.repository';
import { SubscribeService } from 'subscribe/subscribe.service';
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
            clientId: 'subscribe-auth-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'subscribe-auth-consumer',
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
  controllers: [HttpSubscribeController, KafkaSubscribeController],
  providers: [SubscribeService, SubscribeRepository, AuthEvent, AuthGuard, PrismaService],
})
export class SubscribeModule {}
