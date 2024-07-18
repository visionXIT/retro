import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { MultiplicationModule } from 'multiplication.module';
import { SERVER_PORT } from 'utils/env';

async function bootstrap() {
  const app = await NestFactory.create(MultiplicationModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 204,
    },
  });
  app.use(cookieParser());
  await app.listen(SERVER_PORT, () => console.log(`Server Ok start, ${SERVER_PORT}`));
}

bootstrap();
