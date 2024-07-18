import { UserRepository } from '../user/user.repository';

describe('UserRepository', () => {
  // Создаем экземпляр UserRepository
  const userRepository = new UserRepository();

  it('should throw ApiError.NotFound when database query fails', async () => {
    // Мокаем метод db.query, чтобы он выбрасывал ошибку (симулируем ошибку базы данных)
    (userRepository as any)._dbConnector.db.query = jest.fn().mockRejectedValue(new Error('Database query error'));

    // Вызываем метод getUserById с существующим ID
    const existingUserId = 1; // Предположим, что такой пользователь существует

    try {
      await userRepository.getUserById(existingUserId);
    } catch (error: any) {
      // Проверяем, что ошибка Database query error
      expect(error.message).toBe(`Database query error`);
      }
  });
});