import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should select a random network from the list', () => {
    const networkList: string[] = ['Ethereum', 'Binance Smart Chain', 'Polygon', 'Avalanche', 'Solana'];

    // Вызываем метод для выбора случайной сети из списка
    const selectedNetwork = UtilsEcosystem.randomNetworkFromListNetwork(networkList);

    // Проверяем, что выбранная сеть присутствует в списке
    expect(networkList).toContain(selectedNetwork);
  });
});

