import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should return a random token or network from the provided list', () => {
    const tokensOrNetworks = ['ETH', 'BTC', 'BSC', 'AVAX'];

    // Вызываем метод и сохраняем результат
    const result = UtilsEcosystem.randomTokenOrNetworkFromListTokensOrNetwork(tokensOrNetworks);

    // Проверяем, что результат присутствует в исходном массиве
    expect(tokensOrNetworks).toContain(result);
  });
});