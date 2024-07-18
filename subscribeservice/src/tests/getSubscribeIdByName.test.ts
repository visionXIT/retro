import { expect } from 'chai';
import { instance, mock, when } from 'ts-mockito';
import { SubscribeService } from '../subscribe/subscribe.service';
import { SubscribeRepository } from '../subscribe/subscribe.repository';


describe('SubscribeService', () => {
  it('should get subscribe id by name', async () => {
    const subscribeRepository = mock(SubscribeRepository);
    const subscribeService = new SubscribeService(instance(subscribeRepository));

    const subscribeName = 'Example Subscribe';
    const expectedSubscribeId = 123;

    when(subscribeRepository.getSubscribeIdByName(subscribeName)).thenReturn(Promise.resolve(expectedSubscribeId));

    const result = await subscribeService.getSubscribeIdByName(subscribeName);

    // Проверяем, что метод вернул ожидаемый идентификатор
    expect(result).to.equal(expectedSubscribeId);
  });
});

  

