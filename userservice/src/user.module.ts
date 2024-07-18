import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { UserController } from 'user/user.controller';
import { UserRepository } from 'user/user.repository';
import { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } from 'utils/env';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  controllers: [UserController],
  providers: [
    UserRepository,
    PrismaService,
  ],
})
export class UserModule {}
