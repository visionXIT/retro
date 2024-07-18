import { expect } from 'chai';
import { instance, mock, when } from 'ts-mockito';
import { SubscribeService } from '../subscribe/subscribe.service';
import { SubscribeRepository } from '../subscribe/subscribe.repository';



describe('SubscribeService', () => {
  it('should check if user is subscribed', async () => {
    // Создаем мок SubscribeRepository
    const subscribeRepository = mock(SubscribeRepository);
    const subscribeService = new SubscribeService(instance(subscribeRepository));

    // Устанавливаем ожидаемое поведение мока
    when(subscribeRepository.checkUserSubscribed(123)).thenReturn(Promise.resolve(true));

    // Вызываем метод, который мы хотим протестировать
    const isSubscribed = await subscribeService.checkUserSubscribed(123);

    // Проверяем, что результат соответствует нашему ожиданию
    expect(isSubscribed).to.equal(true); // Используем методы утверждения Jest
  });

});



  

