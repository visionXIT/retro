import { Global, Module } from '@nestjs/common';
import { SendController } from 'sender/sender.controller';
import { SendService } from 'sender/sender.service';

@Global()
@Module({
  controllers: [SendController],
  providers: [SendService],
})
export class SenderModule {}
