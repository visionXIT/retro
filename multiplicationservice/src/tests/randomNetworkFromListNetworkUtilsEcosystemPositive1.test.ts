import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should select a random network from the list', () => {
    const networks = ['Ethereum', 'Binance Smart Chain', 'Polygon', 'Avalanche', 'Solana'];

    // Вызываем метод для выбора случайной сети из списка
    const selectedNetwork = UtilsEcosystem.randomNetworkFromListNetwork(networks);

    // Проверяем, что выбранная сеть находится в списке сетей
    expect(networks).toContain(selectedNetwork);
  });
});