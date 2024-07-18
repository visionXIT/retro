import { UtilsEcosystem } from '../multiplication/utils/utils-ecosystem.service';

describe('UtilsEcosystem', () => {
  it('should generate correct network paths for operations', () => {
    // Задаем две сети для генерации путей
    const fromNetwork = 'NetworkA';
    const toNetwork = 'NetworkB';

    // Вызываем метод для генерации путей
    const paths = UtilsEcosystem.generateNetworkPathsForOperations(fromNetwork, toNetwork);

    // Проверяем, что массив путей не пустой
    expect(paths).not.toBeNull();
    // Проверяем, что массив путей содержит один элемент, так как у нас есть только две сети
    expect(paths).toHaveLength(1);
    // Проверяем, что сгенерированный путь соответствует переданным сетям
    expect(paths[0]).toEqual({ fromNetwork, toNetwork });
  });
});
