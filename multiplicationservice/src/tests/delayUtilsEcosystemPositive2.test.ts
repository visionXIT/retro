import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should delay for a specific duration', async () => {
    const delayDuration = 2; // Задержка в секундах
    const startTime = Date.now();

    await UtilsEcosystem.delay(delayDuration, delayDuration);

    const endTime = Date.now();
    const elapsedSeconds = (endTime - startTime) / 1000;

    // Проверяем, что задержка была выполнена в указанное время
    expect(elapsedSeconds).toBeCloseTo(delayDuration, 0); // Позволяет небольшое отклонение
  });
});
