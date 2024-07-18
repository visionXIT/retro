import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should return a random element from the provided array of tokens or networks', () => {
    const tokensOrNetworks = ['BTC', 'ETH', 'BSC', 'MATIC', 'SOL'];

    // Вызываем метод и сохраняем результат
    const result = UtilsEcosystem.randomTokenOrNetworkFromListTokensOrNetwork(tokensOrNetworks);

    // Проверяем, что результат присутствует в исходном массиве
    
    expect(tokensOrNetworks).toContain(result);
  });
});

