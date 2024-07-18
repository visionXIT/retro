import { expect } from 'chai';
import { SubscribeController } from '../subscribe/subscribe.controller'; 
import { instance, mock, when } from 'ts-mockito';
import { SubscribeService } from '../subscribe/subscribe.service';
import { OnSubscribeType, SubscribeType } from '../types/types';


describe('SubscribeController', () => {
  it('should add a new subscription', async () => {
    // Создаем моки для SubscribeService и контроллера
    const subscribeService = mock(SubscribeService);
    const subscribeController = new SubscribeController(instance(subscribeService));

    // Подготовленные данные для теста
    const userId = 1;
    const subscribeInfo: OnSubscribeType = {
      numActions: 10,
      subscribeId: 42,
      // другие поля subscribeInfo
    };

    // Ожидаемый результат
    const expectedResult: SubscribeType = {
      id: 123,
      name: 'Example Subscribe',
      actionCost: 5,
      state: [
        {
          actions: 10,
          wallet: 'ttertretretertr',
        },
      ],
      actionsLimit: 20,
      actionsUsed: 0,
    };

    // Настраиваем мок SubscribeService
    when(subscribeService.subscribeUser(userId, subscribeInfo)).thenResolve(expectedResult);

    // Вызываем метод контроллера
    const result = await subscribeController.addSubscribe({ subscribeInfo, userId });

    // Проверяем результат
    expect(result).to.deep.equal(expectedResult);
  });
});
  

