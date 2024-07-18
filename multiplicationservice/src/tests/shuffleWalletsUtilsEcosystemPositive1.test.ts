import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';
import { Wallet } from 'ethers';

describe('UtilsEcosystem', () => {
  it('should shuffle an array of wallets and not preserve the original order', () => {
    // Создаем массив действительных приватных ключей
    const privateKeys: string[] = [
      '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      '0x0123456789abcdef0177756789abcdef0123456789abcdef0123456789abcdef',
      '0xabcdef0123456789abcdef8888456789abcdef0123456789abcdef0123456789',
      '0xabcdef0123456789abcdef8888456789abcdef0123456789ab777f0123456789',
    ];

    // Создаем массив кошельков на основе приватных ключей
    const wallets: Wallet[] = privateKeys.map((privateKey) => new Wallet(privateKey));

    // Копируем исходный массив кошельков
    const originalWallets = [...wallets];

    // Вызываем метод для перемешивания массива кошельков
    const shuffledWallets = UtilsEcosystem.shuffleWallets(wallets);

    // Проверяем, что исходный массив кошельков не равен перемешанному массиву
    expect(originalWallets).not.toEqual(shuffledWallets);

    // Проверяем, что адреса первого кошелька в исходном и перемешанном массивах не совпадают
    const firstWalletInOriginalOrder = originalWallets[0];
    const firstWalletInShuffledOrder = shuffledWallets[0];
    expect(firstWalletInOriginalOrder.address).not.toEqual(firstWalletInShuffledOrder.address);
  });
});
