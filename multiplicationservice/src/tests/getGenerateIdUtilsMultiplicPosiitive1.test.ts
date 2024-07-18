import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should return a random network from the provided list', () => {
    const networkList: string[] = ['NetworkA', 'NetworkB', 'NetworkC'];

    // Вызываем метод для выбора случайной сети из списка
    const selectedNetwork = UtilsEcosystem.randomNetworkFromListNetwork(networkList);

    // Проверяем, что выбранная сеть находится в списке
    expect(networkList).toContain(selectedNetwork);
  });
});
