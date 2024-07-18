import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UserModule } from 'user.module';
import { KAFKA_SERVER_URL } from 'utils/env';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(UserModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [KAFKA_SERVER_URL],
      },
      consumer: {
        groupId: 'user-consumer',
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
