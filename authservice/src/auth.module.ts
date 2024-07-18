import { Global, Module, MiddlewareConsumer } from '@nestjs/common';
import { KafkaAuthController } from 'auth/auth-kafka.controller';
import { AuthController } from 'auth/auth.controller';
import { AuthService } from 'auth/auth.service';
import { JwtRepository } from 'jwt/jwt.repository';
import { JwtService } from 'jwt/jwt.service';
import { SenderEvent, UserEvent } from 'kafka';
import { AuthMiddleware } from 'middleware/auth.middleware';
import { RegistrationController } from 'register/register.controller';
import { RegistrationService } from 'register/register.service';
import { PrismaService } from './prisma/prisma.service';
import { VerificationController } from './verification/verification.controller';
import { VerificationService } from './verification/verification.service';
import { VerificationRepository } from 'verification/verification.repository';
import { LoggerMiddleware } from 'middleware/logging.middleware';

@Global()
@Module({
  imports: [],
  controllers: [AuthController, RegistrationController, KafkaAuthController, VerificationController],
  providers: [
    AuthService,
    JwtService,
    JwtRepository,
    RegistrationService,
    UserEvent,
    SenderEvent,
    AuthMiddleware,
    AuthController,
    PrismaService,
    VerificationService,
    VerificationRepository
  ],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(...['/auth/register', '/auth/login', '/auth/forgotPassword'])
      .forRoutes('*');
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
