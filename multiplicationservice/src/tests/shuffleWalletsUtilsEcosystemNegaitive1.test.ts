import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';
import { Wallet } from 'ethers';

describe('UtilsEcosystem', () => {
  it('should return an empty array when shuffling an empty array of wallets', () => {
    // Создаем пустой массив кошельков
    const wallets: Wallet[] = [];

    // Вызываем метод для перемешивания пустого массива кошельков
    const shuffledWallets = UtilsEcosystem.shuffleWallets(wallets);

    // Проверяем, что результат - пустой массив
    expect(shuffledWallets).toEqual([]);
  });
});
