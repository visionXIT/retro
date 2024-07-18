import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AddWalletsType, OnSubscribeType } from 'types/types';
import { SubscribeService } from './subscribe.service';
import { RpcErrorFilter } from 'error/api-error-rpc.filter';

@UseFilters(RpcErrorFilter)
@Controller()
export class KafkaSubscribeController {
  constructor(private _subscribeService: SubscribeService) {}

  @MessagePattern('add-subscribe.subscribe')
  public async addSubscribe(@Payload() message: { subscribeInfo: OnSubscribeType; userId: number }) {
    const { subscribeInfo, userId } = message;

    const subscribe = await this._subscribeService.subscribeUser(userId, subscribeInfo);
    return subscribe;
  }

  @MessagePattern('check-user-subscribed.subscribe')
  public async checkUserSubscribed(@Payload() message: { userId: string | number }) {
    const userId = message;

    const subscribed = await this._subscribeService.checkUserSubscribed(+userId);
    return subscribed;
  }

  @MessagePattern('add-action.subscribe')
  public async addActionToSubscribe(@Payload() message: { addWalletsInfo: AddWalletsType; userId: number }) {
    const { addWalletsInfo, userId } = message;

    const subscribe = await this._subscribeService.addWalletsToSubscribe(userId, addWalletsInfo);
    return subscribe;
  }

  @MessagePattern('get-subscribe-by-user-and-subscribe-id.subscribe')
  public async getSubscribeByUserAndSubscribeId(@Payload() message: { subscribeId: number; userId: string | number }) {
    const { subscribeId, userId } = message;

    const subscribe = await this._subscribeService.getSubscribeByUserAndSubscribeId(+userId, +subscribeId);
    return subscribe;
  }

  @MessagePattern('get-subscribe-by-user-id.subscribe')
  public async getSubscribesByUserId(@Payload() message: { userId: number | string }) {
    const { userId } = message; 

    const subscribe = await this._subscribeService.getSubscribesByUserId(+userId);
    return subscribe;
  }

  @MessagePattern('get-subscribe-id-by-name.subscribe')
  public async getSubscribeIdByName(@Payload() message: { name: string }) {
    const { name } = message;

    const subscribeId = await this._subscribeService.getSubscribeIdByName(name);
    return subscribeId;
  }

  @MessagePattern('get-balance.subscribe')
  public async getBalanceOnSubscribe(@Payload() message: { subscribeId: number; userId: string | number }) {
    const { subscribeId, userId } = message;

    const balance = await this._subscribeService.getBalanceOnSubscribe(+subscribeId, +userId);
    return balance;
  }
}
