import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { IPaymentService, PaymentData, PaymentStatusType, PaymentType } from 'types/types';
import { PaymentRepository } from './payment.repository';
import { minPaymentAmount, nowPaymentsUrl } from 'utils/const';
import { NOW_PAYMENT_API_KEY, PAYMENT_EXPIRE_TIME } from 'utils/env';
import { ApiError } from 'error/api.error';
import { LoggerEvent } from '../kafka/logger/logger.kafka';

@Injectable()
export class PaymentService implements IPaymentService {
  constructor(private _paymentRepository: PaymentRepository, private _logger: LoggerEvent) {
  }

  async createPaymentInvoice(userId: number, subscribeId: number, actions: number): Promise<PaymentData> {
    if (actions === 0 || !actions) {
      throw ApiError.BadRequest('The number of actions required to subscribe must be greater than 0!');
    }

    if (!userId || !subscribeId) {
      throw ApiError.BadRequest('You should provide userId and subscribeId');
    }


    const actionCost = await this._paymentRepository.getPriceSubscribeById(subscribeId);

    if (!actionCost) {
      throw ApiError.NotFound('Cannot find subscribe with given id');
    }

    if (actionCost * actions < minPaymentAmount) {
      throw ApiError.BadRequest('Min amount of payment is 5$');
    }

    const setting = {
      payment: {
        price_amount: actions * actionCost,
        price_currency: 'usd',
        pay_currency: 'usdttrc20',
        order_id: `Retro-${this._generateOrderId()}`,
        order_description: JSON.stringify({
          userId,
          subscribeId,
          actions,
        }),
      },
      config: {
        headers: {
          'x-api-key': NOW_PAYMENT_API_KEY,
          'Content-Type': 'application/json',
        },
      },
    };

    const payment = (
      await axios.post<typeof setting, PaymentType>(`${nowPaymentsUrl}/v1/payment`, setting.payment, setting.config)
    ).data;




    // !Думать тут
    await this._paymentRepository.addNewPayment(userId, payment);
    ///////////////////////////////////////////////////////////

    // функция вызывается без await чтобы при создании платежа проверять его статус в фоне в течении указанного времени
    this.startCheckingPaymentStatus(payment.payment_id);

    return payment;
  }

  async startCheckingPaymentStatus(paymentId: string) {
    const setting = {
      config: {
        headers: {
          'x-api-key': NOW_PAYMENT_API_KEY,
          'Content-Type': 'application/json',
        },
      },
    };

    const createdAt = await this._paymentRepository.getCreationTimeStamp(paymentId);

    while (true) {
      const paymentStatus = (
        await axios.get<typeof setting, PaymentStatusType>(`${nowPaymentsUrl}/v1/payment/${paymentId}`, setting.config)
      ).data;
      const paymentStatusFromDB = await this._paymentRepository.getPaymentStatus(Number(paymentId));
      console.log(paymentStatusFromDB)

      const timeNow = Date.now();
      if(timeNow - createdAt > 1000 * 60 * PAYMENT_EXPIRE_TIME) {
        await this._logger.addLogInLogList({ ...paymentStatus, payment_status: 'expired' });
        await this._paymentRepository.updatePaymentStatus(paymentId.toString(), 'expired');
        return;
      }

      if(paymentStatus.payment_status === "finished" || paymentStatusFromDB === "finished") {
        const { userId, subscribeId, actions } = JSON.parse(paymentStatus.order_description);
        await this._paymentRepository.addActionsToSubscription(userId, subscribeId, actions);

        await this._logger.addLogInLogList({ ...paymentStatus, payment_status: 'finished' });
        await this._paymentRepository.updatePaymentStatus(paymentId.toString(), paymentStatus.payment_status);
        return;
      }

      if(paymentStatusFromDB === "expired") {
        await this._logger.addLogInLogList({ ...paymentStatus, payment_status: 'expired' });
        await this._paymentRepository.updatePaymentStatus(paymentId.toString(), paymentStatus.payment_status);
        return;
      }

      if (paymentStatus.payment_status != "waiting") {
        await this._logger.addLogInLogList(paymentStatus);
        await this._paymentRepository.updatePaymentStatus(paymentId.toString(), paymentStatus.payment_status);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  async checkingPaymentStatus(paymentId: number) {
    return await this._paymentRepository.getPaymentStatus(paymentId);
  }

  async cancelPayment(paymentId: number) {
    await this._paymentRepository.cancelPayment(paymentId);
  }

  async getPaymentById(paymentId: number) {
    return await this._paymentRepository.getPaymentById(paymentId);
  }

  private _generateOrderId(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
