import { Body, Controller, Get, Param, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { AuthUser } from 'auth/auth.decorator';
import { AuthGuard } from 'auth/auth.guard';
import { ErrorFilter } from 'error/api-error-http.filter';
import { ApiError } from '../error/api.error';
import { PaymentService } from './payment.service';

@UseFilters(ErrorFilter)
@UseGuards(AuthGuard)
@Controller('/payment')
export class PaymentController {
  constructor(private _paymentService: PaymentService) {
  }

  @Post('/getPaymentForSubscribe')
  public async getPaymentForSubscribe(@AuthUser('userId') userId: number, @Body() message: {
    subscribeId: number;
    actions: number
  }) {
    const { subscribeId, actions } = message;

    return await this._paymentService.createPaymentInvoice(userId, subscribeId, actions);
  }

  @Get('checkPaymentStatus/:paymentId')
  public async getPaymentStatus(
    @Param('paymentId') paymentId: number,
    @AuthUser('userId') _userId: number
  ) {
    const payment = await this._paymentService.getPaymentById(paymentId);
    if(_userId !== payment.user_id) throw ApiError.NotFound('Payment not found');

    return this._paymentService.checkingPaymentStatus(paymentId);
  }

  @Post('cancelPayment/:paymentId')
  public async cancelPayment(
    @Param('paymentId') paymentId: number,
    @AuthUser('userId') _userId: number
  ) {
    const payment = await this._paymentService.getPaymentById(paymentId);

    if(_userId !== payment.user_id) throw ApiError.NotFound('Payment not found');

    await this._paymentService.cancelPayment(paymentId);

    return {
      message: 'Payment canceled',
    }
  }
}
