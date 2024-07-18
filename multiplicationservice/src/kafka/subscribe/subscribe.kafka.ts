import { Observable } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka, Payload } from '@nestjs/microservices';
import { AddWalletsType, OnSubscribeType, SubscribeType } from 'types/services.types';

@Injectable()
export class SubscribeEvent {
  constructor(@Inject('SUBSCRIBE_KAFKA_PRODUCER') private readonly _subscribeClient: ClientKafka) {}

  async onModuleInit() {
    this._subscribeClient.subscribeToResponseOf('add-subscribe.subscribe');
    this._subscribeClient.subscribeToResponseOf('add-action.subscribe');
    this._subscribeClient.subscribeToResponseOf('get-balance.subscribe');
    this._subscribeClient.subscribeToResponseOf('get-subscribe-id-by-name.subscribe');
    this._subscribeClient.subscribeToResponseOf('get-subscribe-by-user-and-subscribe-id.subscribe');
    this._subscribeClient.subscribeToResponseOf('get-subscribe-by-user-id.subscribe');
    this._subscribeClient.subscribeToResponseOf('check-user-subscribed.subscribe');

    await this._subscribeClient.connect();
  }

  async subscribeAddAction(
    @Payload() message: { userId: number; addWalletsInfo: AddWalletsType },
  ): Promise<Observable<string | void>> {
    const result = this._subscribeClient.send('add-action.subscribe', message);

    return result;
  }

  async subscribeGetSubscribeByUserId(
    @Payload() message: { userId: number },
  ): Promise<Observable<string | SubscribeType[]>> {
    const result = this._subscribeClient.send('get-subscribe-by-user-id.subscribe', message);

    return result;
  }

  async subscribeCheckUserSubscribed(
    @Payload() message: { userId: string | number },
  ): Promise<Observable<string | boolean>> {
    const result = this._subscribeClient.send('check-user-subscribed.subscribe', message);

    return result;
  }

  async subscribeGetSubscribeByUserAndSubscribeId(
    @Payload() message: { subscribeId: number; userId: string | number },
  ): Promise<Observable<string | SubscribeType>> {
    const result = this._subscribeClient.send('get-subscribe-by-user-and-subscribe-id.subscribe', message);

    return result;
  }

  async getSubscribeIdByName(
    @Payload() message: { name: string },
  ): Promise<Observable<{ id: number; coastOneAction: number }>> {
    try {
      const result = this._subscribeClient.send<{ id: number; coastOneAction: number }>(
        'get-subscribe-id-by-name.subscribe',
        message,
      );

      return result;
    } catch (error) {
      return await this.getSubscribeIdByName(message);
    }
  }

  async getBalanceOnSubscribe(
    @Payload() message: { subscribeId: number; userId: string | number },
  ): Promise<Observable<number>> {
    const result = this._subscribeClient.send('get-balance.subscribe', message);

    return result;
  }

  async subscribeAdd(
    @Payload() message: { subscribeInfo: OnSubscribeType; userId: number },
  ): Promise<Observable<string | SubscribeType>> {
    const result = this._subscribeClient.send('add-subscribe.subscribe', message);

    return result;
  }
}
