import { NestFactory } from '@nestjs/core';
import { PromocodeModule } from 'promocode.module';
import { SERVER_PORT } from 'utils/env';

async function bootstrap() {
  const app = await NestFactory.create(PromocodeModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 204,
    }
  });
  
  await app.listen(SERVER_PORT, () => console.log(`Server started on ${SERVER_PORT}`));
}

bootstrap();
