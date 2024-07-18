import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGuard } from 'auth/auth.guard';
import { AuthEvent } from 'kafka/auth/auth.event';
import { PaymentController } from 'payment/payment.controller';
import { PaymentRepository } from 'payment/payment.repository';
import { PaymentService } from 'payment/payment.service';
import { KAFKA_SERVER_URL } from 'utils/env';
import { LoggerEvent } from './kafka/logger/logger.kafka';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'LOGGER_KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'logger-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'logger-consumer',
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
        name: 'AUTH_KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment-auth-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'payment-auth-consumer',
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
  controllers: [PaymentController],
  providers: [PrismaService, PaymentService, PaymentRepository, LoggerEvent, AuthGuard, AuthEvent],
})
export class PaymentModule {}
