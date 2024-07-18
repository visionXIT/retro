import { Injectable } from '@nestjs/common';
import { SubscribeRepository } from './subscribe.repository';
import { AddWalletsType, ISubscribeService, OnSubscribeType, SubscribeType } from 'types/types';
import { ApiError } from 'error/api.error';

@Injectable()
export class SubscribeService implements ISubscribeService {
  constructor(private _subscribeRepo: SubscribeRepository) {}

  public async getBalanceOnSubscribe(subscribeId: number, userId: number): Promise<number> {
    if (!subscribeId || !userId) {
      throw ApiError.BadRequest('You must provide subscribe id and user id');
    }

    return await this._subscribeRepo.getBalanceOnSubscribe(subscribeId, userId);
  }

  public async getSubscribeIdByName(subscribeName: string): Promise<{ id: number; coastOneAction: number }> {
    if (!subscribeName) {
      throw ApiError.BadRequest('You must provide a subscribe name');
    }

    const data = await this._subscribeRepo.getSubscribeIdByName(subscribeName);
    if (!data) {
      throw ApiError.NotFound('Cannot find subscribe id for given name');
    }
    return data;
  }

  public async checkUserSubscribed(userId: number): Promise<boolean> {
    return await this._subscribeRepo.checkUserSubscribed(userId);
  }

  public async addWalletsToSubscribe(userId: number, subscribeInfo: AddWalletsType) {
    if (!subscribeInfo.wallet) {
      throw ApiError.BadRequest('You must provide a wallets array');
    }

    await this.checkSubscribeId(subscribeInfo.subscribeId);

    await this._subscribeRepo.addWalletsToSubscribe(subscribeInfo.wallet, userId, subscribeInfo.subscribeId);
  }

  public async subscribeUser(userId: number, subscribeInfo: OnSubscribeType): Promise<SubscribeType> {
    if (!subscribeInfo.numActions || !subscribeInfo.subscribeId || subscribeInfo.numActions <= 0) {
      throw ApiError.BadRequest('You must provide correct numActions, wallets array and id of the subscribe');
    }

    await this.checkSubscribeId(subscribeInfo.subscribeId);

    const subscribe = await this._subscribeRepo.getUserSubscribeActionsById(subscribeInfo.subscribeId, userId);

    if (!subscribe) {
      await this._subscribeRepo.subscribeUser(userId, subscribeInfo);
    } else {
      await this._subscribeRepo.updateSubscribe(userId, subscribe.actionsLimit + subscribeInfo.numActions, subscribe.id);
    }

    return subscribe as SubscribeType;
  }

  public async getSubscribesByUserId(userId: number): Promise<SubscribeType[]> {
    return await this._subscribeRepo.getSubscribesByUserId(userId);
  }

  public async getSubscribeByUserAndSubscribeId(userId: number, subscribeId: number): Promise<SubscribeType> {
    const subscribe = await this._subscribeRepo.getSubscribeByUserAndSubscribeId(userId, subscribeId);

    if (!subscribe) {
      throw ApiError.NotFound('Incorrect subscribe id');
    }

    return subscribe;
  }

  private async checkSubscribeId(id: number) {
    if (!(await this._subscribeRepo.checkSubscribeId(id))) {
      throw ApiError.NotFound('Incorrect subscribe id');
    }
  }
}
