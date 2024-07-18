import { expect } from 'chai';
import { instance, mock, when } from 'ts-mockito';
import { SubscribeService } from '../subscribe/subscribe.service';
import { SubscribeRepository } from '../subscribe/subscribe.repository';
import { SubscribeType } from '../types/types';


describe('SubscribeService', () => {
  it('should get a subscribe by user and subscribe id', async () => {
    const subscribeRepository = mock(SubscribeRepository);
    const subscribeService = new SubscribeService(instance(subscribeRepository));

    const userId = 12;
    const subscribeId = 20;
    const expectedSubscribe: SubscribeType = {
      id: 0,
      name: '',
      actionCost: 0,
      state: [],
      actionsLimit: 0,
      actionsUsed: 0
    };

    when(subscribeRepository.getSubscribeByUserAndSubscribeId(userId, subscribeId)).thenReturn(
      Promise.resolve(expectedSubscribe)
    );

    const result = await subscribeService.getSubscribeByUserAndSubscribeId(userId, subscribeId);

    // Проверяем, что метод вернул ожидаемый объект SubscribeType
    expect(result).to.deep.equal(expectedSubscribe);
  });
});




  

