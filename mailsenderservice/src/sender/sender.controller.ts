import { Controller, UseFilters } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { SendService } from './sender.service';
import { SendMessageParamsType } from 'types/types';
import { RpcErrorFilter } from 'error/api-error-rpc.filter';

@UseFilters(RpcErrorFilter)
@Controller()
export class SendController {
  constructor(private _sendService: SendService) {}

  @EventPattern('send-email.sender')
  public async sendMailToClient(@Payload() message: SendMessageParamsType) {
    const { email, subject, text, typeMessage } = message;

    await this._sendService.sendMailToClient({
      email,
      subject,
      text,
      typeMessage,
    });
  }
}
