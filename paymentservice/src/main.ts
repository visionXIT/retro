import { NestFactory } from '@nestjs/core';
import { PaymentModule } from 'payment.module';
import { SERVER_PORT } from 'utils/env';

async function bootstrap() {
  const app = await NestFactory.create(PaymentModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 204,
    }
  });
  
  await app.listen(SERVER_PORT);
  console.log("Payment service started on " + SERVER_PORT)
}

bootstrap();
