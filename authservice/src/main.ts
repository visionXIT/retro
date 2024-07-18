import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AuthModule } from 'auth.module';
import { KAFKA_SERVER_URL, SERVER_PORT } from 'utils/env';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 204,
    },
  });
  
  app.use(cookieParser());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [KAFKA_SERVER_URL],
      },
      consumer: {
        groupId: 'auth-consumer',
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
  console.log("Auth service started on " + SERVER_PORT)
}

bootstrap();
