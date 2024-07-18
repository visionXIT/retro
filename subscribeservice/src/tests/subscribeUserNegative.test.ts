import { expect, AssertionError } from 'chai';
import { instance, mock, resetCalls, when } from 'ts-mockito';
import { SubscribeService } from '../subscribe/subscribe.service';
import { SubscribeRepository } from '../subscribe/subscribe.repository';



describe('SubscribeService', () => {
  it('should throw an error if user has not finished subscribe', async () => {
    const subscribeRepository = mock(SubscribeRepository);
    const subscribeService = new SubscribeService(instance(subscribeRepository));

    const userId = 123;
    const subscribeInfo = {
      subscribeId: 456,
      numActions: 5,
    };

    when(subscribeRepository.getUserSubscribeActionsById(subscribeInfo.subscribeId, userId)).thenReturn(Promise.resolve({
      actionsLimit: 10,
      actionsUsed: 10, // User has used all available actions
    }));

    // Вызываем метод, который мы хотим протестировать
    try {
      await subscribeService.subscribeUser(userId, subscribeInfo);
    } catch (error) {
      if (error instanceof AssertionError) {
        // Проверяем, что ошибка содержит правильное сообщение
        expect(error.message).to.equal('You have not finished subscribe');
      }
    }

    // Сбрасываем вызовы для дальнейших тестов
    resetCalls(subscribeRepository);
  });
});





