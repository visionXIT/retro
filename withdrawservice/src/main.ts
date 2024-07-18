import { NestFactory } from '@nestjs/core';
import { SERVER_PORT } from 'utils/env';
import { WithdrawModule } from 'withdraw.module';

async function bootstrap() {
  const app = await NestFactory.create(WithdrawModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      optionsSuccessStatus: 204,
    }
  });

  await app.listen(SERVER_PORT, () => console.log("Server successfully started"));
}

bootstrap();
