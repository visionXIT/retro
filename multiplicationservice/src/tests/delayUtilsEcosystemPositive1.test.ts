import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should delay for a random time within the specified range', async () => {
    const minDelay = 1; // Минимальная задержка в секундах
    const maxDelay = 5; // Максимальная задержка в секундах
    const startTime = Date.now();

    await UtilsEcosystem.delay(minDelay, maxDelay);

    const endTime = Date.now();
    const elapsedSeconds = (endTime - startTime) / 1000;

    // Проверяем, что задержка была выполнена в указанных пределах
    expect(elapsedSeconds).toBeGreaterThanOrEqual(minDelay);
    expect(elapsedSeconds).toBeLessThanOrEqual(maxDelay);
  });
});
