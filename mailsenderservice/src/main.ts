import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SenderModule } from 'mail-sender.module';
import { KAFKA_SERVER_URL } from 'utils/env';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(SenderModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [KAFKA_SERVER_URL],
      },
      consumer: {
        groupId: 'mail-sender-consumer',
      },
      producer: {
        allowAutoTopicCreation: true,
      },
      run: {
        autoCommit: true,
      },
    },
  });
  app.listen().then(() => {
    console.log('Listening events');
  });
}

bootstrap();
