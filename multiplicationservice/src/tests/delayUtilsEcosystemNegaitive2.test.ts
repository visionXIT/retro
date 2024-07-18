import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should throw an error when min delay is greater than max delay', async () => {
    const minDelay = 2000; // Минимальное время задержки 2 секунды
    const maxDelay = 1000; // Максимальное время задержки 1 секунда

    let error;

    try {
      await UtilsEcosystem.delay(minDelay, maxDelay); // Попытка вызвать метод с заданными параметрами
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.message).toBe('The minimum value must be less than the maximum value');
    }

  });
});