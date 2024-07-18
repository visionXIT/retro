import { PaymentService } from '../payment/payment.service';
import { PaymentRepository } from '../payment/payment.repository';
import axios from 'axios';
import { LoggerEvent } from '../kafka/logger/logger.kafka';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  const mockPaymentRepository: Partial<PaymentRepository> = {};
  const mockLoggerEvent: Partial<LoggerEvent> = {};

  beforeAll(() => {
    paymentService = new PaymentService(mockPaymentRepository as PaymentRepository, mockLoggerEvent as LoggerEvent);
  });

  it('should return "waiting" status', async () => {
    // Mock axios.get to simulate the API response with "waiting" status
    const mockPaymentStatus = {
      payment_status: 'waiting',
      order_description: JSON.stringify({
        userId: 1,
        subscribeId: 2,
        actions: 3,
      }),
    };

    // Mock getPriceSubscribeById to return a fixed value
    // mockPaymentRepository.getPriceSubscribeById = jest.fn(async (subscribeId: number) => {
    //   return { actionCost: 10, name: 'zkSync Era' };
    // });

    // Mock axios.get to return "waiting" status
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: mockPaymentStatus,
    });

    const userId = 1;
    const subscribeId = 2;
    const actions = 3;

    const result = await paymentService.checkingPaymentStatus(1);

    expect(result).toBe('waiting');
  });
});