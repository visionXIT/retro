import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should select the only network from the list', () => {
    const singleNetwork = ['Ethereum'];

    // Вызываем метод для выбора случайной сети из списка (содержащего только одну сеть)
    const selectedNetwork = UtilsEcosystem.randomNetworkFromListNetwork(singleNetwork);
    const Network = singleNetwork[0];
    // Проверяем, что выбранная сеть равна единственной сети в списке (массивы должны быть глубоко равными)
    expect(selectedNetwork).toEqual(Network);
  });
});
