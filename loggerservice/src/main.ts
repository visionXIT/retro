import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestFactory } from '@nestjs/core';
import { LoggerModule } from './logger.module';
import { KAFKA_SERVER_URL, SERVER_PORT } from 'utils/env';

class SocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: "*",
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
      },
    });
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(LoggerModule);
  app.enableCors({
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'logger-consumer',
        brokers: [KAFKA_SERVER_URL],
      },
      consumer: {
        groupId: 'logger-consumer',
      },
      run: {
        autoCommit: true,
      },
    },
  });

  app.useWebSocketAdapter(new SocketIoAdapter(app));
  await app.startAllMicroservices();
  await app.listen(SERVER_PORT, () => console.log('Server listener...'));
}

bootstrap();
