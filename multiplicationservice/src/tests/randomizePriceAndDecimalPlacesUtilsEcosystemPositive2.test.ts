import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should randomize price and decimal places within specified range', () => {
    const minPrice = 5;
    const maxPrice = 10;
    const minDecimalPlaces = 1;
    const maxDecimalPlaces = 3;

    const randomizedPrice = UtilsEcosystem.randomizePriceAndDecimalPlaces(
      minPrice,
      maxPrice,
      minDecimalPlaces,
      maxDecimalPlaces
    );

    // Проверяем, что значение цены находится в заданном диапазоне
    expect(Number(randomizedPrice)).toBeGreaterThanOrEqual(minPrice);
    expect(Number(randomizedPrice)).toBeLessThanOrEqual(maxPrice);

    // Проверяем, что количество десятичных знаков находится в заданном диапазоне
    const decimalPlaces = (randomizedPrice.split('.')[1] || '').length;
    expect(decimalPlaces).toBeGreaterThanOrEqual(minDecimalPlaces);
    expect(decimalPlaces).toBeLessThanOrEqual(maxDecimalPlaces);
  });
});

