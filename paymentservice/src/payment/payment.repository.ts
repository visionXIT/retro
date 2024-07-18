import { IDBConnector, PaymentData, PaymentDataDB, PaymentStatusData, PaymentStatuses, PaymentUpdateType, SubscribeId } from 'types/types';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentRepository {

  constructor(private _prisma: PrismaService) {}


  // Adds or updates actions for user that makes subscribtion
  async addActionsToSubscription(userId: number, subscribeId: SubscribeId, actions: number) {
    // fetching data from `user_subscribe_table`
    // if no data provided create new table cell where new data is inputed
    // else old data is updating
    const paymentData = await this._prisma.user_subscribe_table.findFirst({
      select: {
        id: true,
        actions_limit: true,
        actions_used: true,
      },
      where: {
        id_user: userId,
      }
    });

    if(!paymentData) {
      await this._addNewSubscribtion(userId, subscribeId, actions);
      return;
    }

    const {id, actions_limit, actions_used } = paymentData;
    await this._updateSubscribtion({
      actions,
      tableId: id,
      oldActionsLimit: actions_limit!,
      actionsUsed: actions_used!});
  }




  async addNewPayment(userId: number, paymentData: PaymentData) {
    await this._prisma.payments_table.create({
      data: {
        user_id: userId,
        payment_id: paymentData.payment_id,
        payment_data: {
          pay_address: paymentData.pay_address,
          pay_amount: paymentData.pay_amount,
          pay_currency: paymentData.pay_currency,
          created_at: paymentData.created_at,
        } as PaymentDataDB,
        payment_status: paymentData.payment_status,
        timestamp: Date.now().toString(),
      }
    })
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatuses) {
    const id = await this._prisma.payments_table.findFirst({
      select: {
        id: true,
      },
      where: {
        payment_id: paymentId,
      }
    })
    if(!id) throw new Error('Payment not found')
    await this._prisma.payments_table.update({
      data: {
        payment_status: status,
      },
      where: {
        id: id.id,
      }
    })
  }

  async getPaymentStatus(paymentId: number): Promise<PaymentStatuses> {
    const status = await this._prisma.payments_table.findFirst({
      select: {
        payment_status: true,
      },
      where: {
        payment_id: paymentId.toString(),
      },
    }) as { payment_status: PaymentStatuses } | null;

    if(!status) throw new Error('Payment not found');

    return status.payment_status;
  }

  async getCreationTimeStamp(paymentId: string): Promise<number> {
    const data = await this._prisma.payments_table.findFirst({
      select: {
        timestamp: true,
      },
      where: {
        payment_id: paymentId,
      }
    })

    if(!data) throw new Error('Payment not found');

    return Number(data.timestamp);
  }

  async getPaymentData(paymentId: string) {
    const result = await this._prisma.payments_table.findFirst({
      select: {
        payment_data: true,
      },
      where: {
        payment_id: paymentId,
      }
    })

    if(!result) throw new Error('Payment not found');

    return result.payment_data;
  }

  async getUserSubscribeActionsById(
    subscribeId: number,
    userId: number,
  ): Promise<{ actionsLimit: number; actionsUsed: number }> {
    const result = await this._prisma.user_subscribe_table.findFirst({
      select: {
        actions_limit: true,
        actions_used: true,
      },
      where: {
        id_subscribe: subscribeId,
        id_user: userId,
      }
    })
    if(!result) return {actionsLimit: 0, actionsUsed: 0};

    return {actionsLimit: Number(result.actions_limit), actionsUsed: Number(result.actions_used)};
  }

  async cancelPayment(paymentId: number) {
    await this._prisma.payments_table.updateMany({
      data: {
        payment_status: 'expired',
      },
      where: {
        payment_id: paymentId.toString(),
      }
    })
  }

  async getPaymentById(paymentId: number) {
    const result = await this._prisma.payments_table.findFirst({
      where: {
        payment_id: paymentId.toString(),
      }
    })

    if(!result) throw new Error('Payment not found');

    return result;
  }

  async clearUserSubscribes(userId: number, subscribeId: number) {
    await this._prisma.user_subscribe_table.updateMany({
      data: {
        is_delete: 1,
      },
      where: {
        id_user: userId,
        id_subscribe: subscribeId,
      }
    })

    await this._prisma.state_subscribe_table.updateMany({
      data: {
        is_delete: 1,
      },
      where: {
        id_user: userId,
        id_subscribe: subscribeId,
      }
    })
  }


  async getPriceSubscribeById(subscribeId: number) {
    const result = await this._prisma.subscribe_table.findFirst({
      select: {
        coast_one_action: true,
      },
      where: {
        id: subscribeId,
      }
    })

    if(!result) throw new Error('Subscribe not found');

    return result.coast_one_action;
  }



  // Adds in table new instance of subscribtion
  // For example if user never buyed subscribtion before
  private async _addNewSubscribtion(userId: number, subscribeId: SubscribeId, actions: number) {
    await this._prisma.user_subscribe_table.create({
      data: {
        id_user: userId,
        id_subscribe: subscribeId,
        actions_limit: actions,
        actions_used: 0,
      }
    })
  }

  // Updates state of subscribtion
  // For example if user already have subscribtion and wants to buy more actions
  private async _updateSubscribtion(paymentUpdateType: PaymentUpdateType) {
    const {tableId, actions, oldActionsLimit, actionsUsed} = paymentUpdateType;

    await this._prisma.user_subscribe_table.update({
      data: {
        actions_limit: oldActionsLimit + actions,
        actions_used: actionsUsed,
      },
      where: {
        id: tableId,
      }
    })
  }


}
