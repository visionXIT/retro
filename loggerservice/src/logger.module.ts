import { Module } from '@nestjs/common';
import { LoggerController } from 'kafka/logger.controller';
import { SocketGateway } from 'socket/socket.gateway';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_SERVER_URL } from 'utils/env';
import { AuthGuard } from 'auth/auth-socket.guard';
import { AuthEvent } from 'kafka/auth/auth.event';

@Module({
  imports: [
    ClientsModule.register(([
      {
        name: 'AUTH_KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'logger-auth-producer',
            brokers: [KAFKA_SERVER_URL],
          },
          consumer: {
            groupId: 'logger-auth-consumer',
            allowAutoTopicCreation: true,
          },
          producer: {
            allowAutoTopicCreation: true,
          },
          run: {
            autoCommit: true,
          },
        }
      }
    ]))
  ],
  controllers: [LoggerController],
  providers: [SocketGateway, AuthGuard, AuthEvent],
})
export class LoggerModule {}
