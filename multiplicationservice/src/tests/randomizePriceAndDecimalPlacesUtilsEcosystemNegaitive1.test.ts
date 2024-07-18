import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should throw an error for an invalid price range', () => {
    const minPrice = 100; // Минимальная цена больше максимальной
    const maxPrice = 50;
    const minDecimalPlaces = 0;
    const maxDecimalPlaces = 2;


    try {
      UtilsEcosystem.randomizePriceAndDecimalPlaces(minPrice, maxPrice, minDecimalPlaces, maxDecimalPlaces)
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error!.message).toBe('The minimum value must be less than the maximum value');
    }

    // Проверяем, что было выброшено исключение и оно содержит нужное сообщение

  });
});


