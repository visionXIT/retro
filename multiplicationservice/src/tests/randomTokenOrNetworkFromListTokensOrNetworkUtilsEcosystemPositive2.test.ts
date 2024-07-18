import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should return the provided token or network when the input is a single value', () => {
    const singleTokenOrNetwork = 'ETH';

    // Вызываем метод и сохраняем результат
    const result = UtilsEcosystem.randomTokenOrNetworkFromListTokensOrNetwork(singleTokenOrNetwork);

    // Проверяем, что результат равен входному значению
    expect(result).toBe(singleTokenOrNetwork);
  });
});

