import { expect, AssertionError } from 'chai';
import { instance, mock, resetCalls, when } from 'ts-mockito';
import { SubscribeService } from '../subscribe/subscribe.service';
import { SubscribeRepository } from '../subscribe/subscribe.repository';
import { OnSubscribeType, SubscribeType } from '../types/types'; // Замените на пути к вашим типам


describe('SubscribeService', () => {
  it('should subscribe a user', async () => {
    // Создайте экземпляр SubscribeRepository и SubscribeService
    const subscribeRepository = new SubscribeRepository();
    const subscribeService = new SubscribeService(subscribeRepository);

    // Задайте данные для подписки
    const userId = 32;
    const subscribeInfo: OnSubscribeType = {
      subscribeId: 10,
      numActions: 10, // Задайте количество действий по вашему случаю
    };
    try {
      const result: SubscribeType = await subscribeService.subscribeUser(userId, subscribeInfo);
    } catch (error) {
      // Если произошла ошибка, тест провалится
      throw error;
    }
  });
});






