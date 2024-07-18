import { Injectable } from '@nestjs/common';
import { ISubscribeRepository, OnSubscribeType, SubscribeType } from 'types/types';
import { ApiError } from 'error/api.error';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SubscribeRepository implements ISubscribeRepository {
  constructor(private readonly _prisma: PrismaService) { }

  public async getBalanceOnSubscribe(subscribeId: number, userId: number): Promise<number> {
    const result = await this._prisma.user_subscribe_table.findFirst({
      select: {
        actions_limit: true,
        actions_used: true
      },
      where: {
        id_user: userId,
        id_subscribe: +subscribeId,
        is_delete: 0
      }
    })
    if (!result) throw ApiError.NotFound('Incorrect subscribeId and/or userId')

    const actions = {
      actionsLimit: result.actions_limit!,
      actionsUsed: result.actions_used!
    }

    return actions.actionsLimit - actions.actionsUsed;
  }

  public async getSubscribeIdByName(subscribeName: string): Promise<{
    id: number;
    coastOneAction: number;
  }> {
    const subscribeData = await this._prisma.subscribe_table.findFirst({
      select: {
        id: true,
        coast_one_action: true
      },
      where: {
        name: subscribeName,
        is_delete: 0
      }
    })

    if (!subscribeData) {
      throw ApiError.NotFound('Cannot find subscribe id for given name');
    }

    return { id: subscribeData.id, coastOneAction: subscribeData.coast_one_action! };
  }

  public async clearUserSubscribes(userId: number, subscribeId: number) {
    await this._prisma.user_subscribe_table.updateMany({
      data: {
        is_delete: 1
      },
      where: {
        id_user: userId,
        id_subscribe: subscribeId
      }
    })

    await this._prisma.state_subscribe_table.updateMany({
      data: {
        is_delete: 1
      },
      where: {
        id_user: userId,
        id_subscribe: subscribeId
      }
    })
  }

  public async checkUserSubscribed(userId: number): Promise<boolean> {
    const subscribe = (
      await this._prisma.$queryRaw<{ id: number }[]>`SELECT id
          FROM user_subscribe_table
          WHERE id_user = ${userId} AND actions_limit > actions_used AND is_delete = 0
          LIMIT 1`
    )[0];
    
    return subscribe ? true : false;
  }

  public async checkSubscribeId(id: number): Promise<boolean> {
    const subscribe = await this._prisma.subscribe_table.findFirst({
      select: {
        id: true
      },
      where: {
        id,
        is_delete: 0
      }
    })

    return subscribe ? true : false;
  }

  public async addWalletsToSubscribe(wallet: string, userId: number, subscribeId: number) {
    const subscribeActionsFromDB = await this._prisma.user_subscribe_table.findFirst({
      select: {
        actions_limit: true,
        actions_used: true,
      },
      where: {
        id_user: userId,
        id_subscribe: subscribeId,
        is_delete: 0
      },
    })

    const subscribeActions = {
      actionsLimit: subscribeActionsFromDB?.actions_limit!,
      actionsUsed: subscribeActionsFromDB?.actions_used!
    }

    if (subscribeActions.actionsLimit - subscribeActions.actionsUsed <= 0) {
      throw ApiError.BadRequest('Not enough actions on your subscribe');
    }

    await this._prisma.user_subscribe_table.updateMany({
      data: {
        actions_used: {
          increment: 1
        }
      },
      where: {
        id_user: userId,
        id_subscribe: subscribeId,
        is_delete: 0
      }
    })

    const existingWallet = await this._prisma.state_subscribe_table.findFirst({
      select: {
        id: true
      },
      where: {
        id_user: userId,
        id_subscribe: subscribeId,
        wallet,
        is_delete: 0
      }
    })

    if (!existingWallet) {

      await this._prisma.state_subscribe_table.create({
        data: {
          actions: 1,
          id_subscribe: subscribeId,
          id_user: userId,
          wallet
        }
      })

    } else {
      const existingWalletId = existingWallet.id;

      await this._prisma.state_subscribe_table.update({
        data: {
          actions: {
            increment: 1
          }
        },
        where: {
          id: existingWalletId,
          is_delete: 0
        }
      })

    }
  }

  public async subscribeUser(userId: number, subscribeInfo: OnSubscribeType) {
    await this._prisma.user_subscribe_table.create({
      data: {
        id_user: userId,
        id_subscribe: subscribeInfo.subscribeId,
        actions_limit: subscribeInfo.numActions,
        actions_used: 0
      }
    })
  }

  public async updateSubscribe(userId: number, actions: number, id: number) {
    await this._prisma.user_subscribe_table.update({
      data: {
        actions_limit: actions
      },
      where: {
        id
      }
    });
  }

  public async getUserSubscribeActionsById(
    subscribeId: number,
    userId: number,
  ): Promise<{ actionsLimit: number; actionsUsed: number, id: number } | null> {
    const result = await this._prisma.user_subscribe_table.findFirst({
      select: {
        actions_limit: true,
        actions_used: true,
        id: true
      },
      where: {
        id_subscribe: +subscribeId,
        id_user: +userId,
        is_delete: 0
      }
    })

    return result ? {
      actionsLimit: result.actions_limit!,
      actionsUsed: result.actions_used!,
      id: result.id
    } : null
  }

  public async getSubscribesByUserId(userId: number): Promise<SubscribeType[]> {
    const result = await this._prisma.user_subscribe_table.findMany({
      select: {
        id: true,
        id_subscribe: true,
        actions_limit: true,
        actions_used: true,
        subscribe_table: {
          select: {
            name: true,
            coast_one_action: true
          }
        }
      },
      where: {
        id_user: userId,
        is_delete: 0
      },
    })

    const userSubscribes: SubscribeType[] = await Promise.all(result.map(async (subscribe) => {
      const state = await this.getUserStateSubscribeById(subscribe.id_subscribe, userId);
      return {
        id: subscribe.id!,
        name: subscribe.subscribe_table?.name!,
        actionCost: subscribe.subscribe_table?.coast_one_action!,
        actionsLimit: subscribe.actions_limit!,
        actionsUsed: subscribe.actions_used!,
        state
      };
    }));

    return userSubscribes;
  }


  public async getSubscribeByUserAndSubscribeId(userId: number, subscribeId: number): Promise<SubscribeType> {
    const result = await this._prisma.subscribe_table.findFirst({
      select: {
        coast_one_action: true,
        name: true
      },
      where: {
        id: +subscribeId,
        is_delete: 0
      }
    })

    const _subscribe = await this.getUserSubscribeActionsById(subscribeId, userId);
    if (!_subscribe) {
      throw  ApiError.NotFound("User susbcribe is not found");
    }

    const {actionsLimit, actionsUsed} = _subscribe;

    const subscribe = {
      actionCost: result?.coast_one_action,
      name: result?.name,
      state: await this.getUserStateSubscribeById(subscribeId, userId),
      actionsLimit,
      actionsUsed
    }

    return subscribe as SubscribeType;
  }

  private async getUserStateSubscribeById(subscribeId: number, userId: number) {
    const result = await this._prisma.state_subscribe_table.findMany({
      select: {
        actions: true,
        wallet: true
      },
      where: {
        id_subscribe: +subscribeId,
        id_user: +userId,
        is_delete: 0
      }
    })

    if (!result.length) return []
    return result as { actions: number; wallet: string }[]
  }
}
