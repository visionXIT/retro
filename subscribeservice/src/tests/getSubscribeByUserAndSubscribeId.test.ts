import { expect } from 'chai';
import { instance, mock, when } from 'ts-mockito';
import { SubscribeService } from '../subscribe/subscribe.service';
import { SubscribeRepository } from '../subscribe/subscribe.repository';
import { SubscribeType } from '../types/types';



describe('SubscribeService', () => {
  it('should get subscribes by user id', async () => {
    const subscribeRepository = mock(SubscribeRepository);
    const subscribeService = new SubscribeService(instance(subscribeRepository));

    const userId = 12;
    const expectedSubscribes: SubscribeType[] = [
    ];

    when(subscribeRepository.getSubscribesByUserId(userId)).thenReturn(Promise.resolve(expectedSubscribes));

    const result = await subscribeService.getSubscribesByUserId(userId);

    // Проверяем, что метод вернул ожидаемый массив объектов SubscribeType
    expect(result).to.deep.equal(expectedSubscribes);
  });
});





  

