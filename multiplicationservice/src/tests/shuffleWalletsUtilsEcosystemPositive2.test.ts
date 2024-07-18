import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';
import { Wallet } from 'ethers';

describe('UtilsEcosystem', () => {
  it('should shuffle an array of wallets', () => {
    // Создаем массив кошельков с действительными приватными ключами
    const wallets: Wallet[] = [
      new Wallet('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
      new Wallet('0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'),
      new Wallet('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
      new Wallet('0xabcdef0123456789a777ef0123456789abcdef0123456789abcdef0123456789'),
      new Wallet('0x0123456789abcdef0123456789abcdef0123456789ab88880123456789abcdef'),
    ];

    // Копируем исходный массив кошельков
    const originalWallets = [...wallets];

    // Вызываем метод для перемешивания массива кошельков
    const shuffledWallets = UtilsEcosystem.shuffleWallets(wallets);

    // Проверяем, что массив кошельков изменился (перемешан)
    expect(originalWallets).not.toEqual(shuffledWallets);

    // Проверяем, что все кошельки из исходного массива присутствуют в перемешанном массиве
    originalWallets.forEach((wallet) => {
      expect(shuffledWallets).toContain(wallet);
    });

    // Проверяем, что размер исходного и перемешанного массивов одинаков
    expect(originalWallets.length).toBe(shuffledWallets.length);
  });
});