import { expect } from 'chai';
import { instance, mock, when } from 'ts-mockito';
import { SubscribeService } from '../subscribe/subscribe.service';
import { SubscribeRepository } from '../subscribe/subscribe.repository';


describe('SubscribeService', () => {
  it('should get balance on subscribe', async () => {
    const subscribeRepository = mock(SubscribeRepository);
    const subscribeService = new SubscribeService(instance(subscribeRepository));

    const subscribeId = 123;
    const userId = 456;
    const expectedBalance = 100;

    when(subscribeRepository.getBalanceOnSubscribe(subscribeId, userId)).thenReturn(Promise.resolve(expectedBalance));

    const result = await subscribeService.getBalanceOnSubscribe(subscribeId, userId);

    // Проверяем, что метод вернул ожидаемый баланс
    expect(result).to.equal(expectedBalance);
  });
});

  

