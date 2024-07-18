import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGuard } from 'auth/auth.guard';
import { AuthEvent } from 'kafka/auth/auth.event';
import { SubscribeEvent } from 'kafka/subscribe/subscribe.event';
import { PrismaService } from 'prisma/prisma.service';
import { PromocodeController } from 'promocode/promocode.controller';
import { PromocodeRepository } from 'promocode/promocode.repository';
import { PromocodeService } from 'promocode/promocode.service';
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
            clientId: 'promocode-auth-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'promocode-auth-consumer',
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
            clientId: 'promocode-subscribe-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'promocode-subscribe-consumer',
          },
          run: {
            autoCommit: true,
          },
        },
      },
    ]),
  ],
  controllers: [PromocodeController], 
  providers: [PromocodeService, AuthEvent, AuthGuard, PromocodeRepository, SubscribeEvent, PrismaService]
})
export class PromocodeModule {}
