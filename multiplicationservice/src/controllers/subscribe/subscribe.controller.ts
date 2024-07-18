import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { SubscribeEvent } from 'kafka';
import { OnSubscribeType } from 'types/services.types';

@Controller()
export class SubscribeController {
  constructor(private _subscribeEvent: SubscribeEvent) {}

  @MessagePattern('check-user-subscribed.subscribe')
  async subscribeCheckUserSubscribed(@Payload() message: { userId: string | number }) {
    return this._subscribeEvent.subscribeCheckUserSubscribed(message);
  }

  @MessagePattern('get-subscribe-by-user-id.subscribe')
  async subscribeGetSubscribeByUserAndSubscribeId(
    @Payload() message: { subscribeId: number; userId: string | number },
  ) {
    return this._subscribeEvent.subscribeGetSubscribeByUserAndSubscribeId(message);
  }

  @MessagePattern('get-subscribe-by-user-and-subscribe-id.subscribe')
  async subscribeGetSubscribeByUserId(@Payload() message: { userId: number }) {
    return this._subscribeEvent.subscribeGetSubscribeByUserId(message);
  }

  @MessagePattern('get-subscribe-id-by-name.subscribe')
  async getSubscribeIdByName(@Payload() message: { name: string }) {
    return this._subscribeEvent.getSubscribeIdByName(message);
  }

  @MessagePattern('get-balance.subscribe')
  async getBalanceOnSubscribe(@Payload() message: { subscribeId: number; userId: string | number }) {
    return this._subscribeEvent.getBalanceOnSubscribe(message);
  }

  @MessagePattern('add-subscribe.subscribe')
  async subscribeAdd(@Payload() message: { subscribeInfo: OnSubscribeType; userId: number }) {
    return this._subscribeEvent.subscribeAdd(message);
  }
}
