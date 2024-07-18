import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { HistoryModule } from 'history.module';
import { KAFKA_SERVER_URL, SERVER_PORT } from 'utils/env';

async function bootstrap() {
  const app = await NestFactory.create(HistoryModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 204,
    }
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [KAFKA_SERVER_URL],
      },
      consumer: {
        groupId: 'history-consumer',
      },
      producer: {
        allowAutoTopicCreation: true,
      },
      run: {
        autoCommit: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(SERVER_PORT, () => console.log(`Server Ok start, ${SERVER_PORT}`));
}

bootstrap();
