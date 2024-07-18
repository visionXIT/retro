import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should throw an error when minDecimalPlaces is negative', () => {
    // Устанавливаем допустимые значения для цены и максимального количества десятичных знаков
    const minPrice = 5;
    const maxPrice = 10;
    // Устанавливаем недопустимое отрицательное значение для minDecimalPlaces
    const minDecimalPlaces = -2;
    const maxDecimalPlaces = 4;

    // Ожидаем, что вызов randomizePriceAndDecimalPlaces с недопустимым minDecimalPlaces вызовет ошибку
    expect(() => UtilsEcosystem.randomizePriceAndDecimalPlaces(minPrice, maxPrice, minDecimalPlaces, maxDecimalPlaces)).toThrowError();
  });
});


