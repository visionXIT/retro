import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';
import { Wallet } from 'ethers';

describe('UtilsEcosystem', () => {
  it('should shuffle an array of wallets and preserve all wallets', () => {
    // Создаем массив кошельков
    const wallets: Wallet[] = [
      new Wallet('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
      new Wallet('0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'),
      new Wallet('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
      new Wallet('0xabcdef0123456789a777ef0123456789abcdef0123456789abcdef0123456789'),
      new Wallet('0x0123456789abcdef0123456789abcdef0123456789ab88880123456789abcdef'),
    ];

    // Вызываем метод для перемешивания массива кошельков
    const shuffledWallets = UtilsEcosystem.shuffleWallets(wallets);

    // Проверяем, что массивы имеют одинаковую длину
    expect(wallets.length).toEqual(shuffledWallets.length);

    // Проверяем, что все кошельки из исходного массива присутствуют в перемешанном массиве
    wallets.forEach((wallet) => {
      expect(shuffledWallets).toContain(wallet);
    });
  });
});
