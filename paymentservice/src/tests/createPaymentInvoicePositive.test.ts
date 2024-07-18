import { PaymentService } from '../payment/payment.service';
import { PaymentRepository } from '../payment/payment.repository';
import { LoggerEvent } from '../kafka/logger/logger.kafka';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  const mockPaymentRepository: Partial<PaymentRepository> = {};
  const mockLoggerEvent: Partial<LoggerEvent> = {};

  beforeAll(() => {
    paymentService = new PaymentService(mockPaymentRepository as PaymentRepository, mockLoggerEvent as LoggerEvent);

    // Мокируем значение NOW_PAYMENT_API_KEY
    (paymentService as any).NOW_PAYMENT_API_KEY = 'your_mocked_api_key';
  });

  it('should generate payment details', async () => {
    // Mock getPriceSubscribeById to return a fixed value
    // mockPaymentRepository.getPriceSubscribeById = jest.fn(async (subscribeId: number) => {
    //   return { actionCost: 10, name: 'zkSync Era' };
    // });

    const userId = 1;
    const subscribeId = 2;
    const actions = 3;

    const paymentData = await paymentService.createPaymentInvoice(userId, subscribeId, actions);

    expect(paymentData).toBeDefined();
    expect(paymentData.price_amount).toBe(30);
    expect(paymentData).not.toBeNull();
  });
});
