import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';


describe('UtilsEcosystem', () => {
  it('should not delay for a negative duration', async () => {
    const negativeDelay = -1; // Отрицательная задержка

    const startTime = Date.now();
    await UtilsEcosystem.delay(negativeDelay, 1); // Первый аргумент отрицателен

    const endTime = Date.now();
    const elapsedSeconds = (endTime - startTime) / 1000;

    // Проверяем, что задержка не была выполнена
    expect(elapsedSeconds).toBeLessThan(1); // Должно быть меньше 1 секунды
  });
});

