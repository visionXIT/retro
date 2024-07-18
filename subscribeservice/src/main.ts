import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SubscribeModule } from 'subscribe.module';
import { KAFKA_SERVER_URL, SERVER_PORT } from 'utils/env';

async function bootstrap() {
  const app = await NestFactory.create(SubscribeModule, {
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
        groupId: 'subscribe-consumer',
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
  await app.listen(SERVER_PORT);
  console.log("Subcribe service started on " + SERVER_PORT)
}

bootstrap();
