import { UserRepository } from '../user/user.repository';


describe('UserRepository', () => {
  // Создаем экземпляр UserRepository
  const userRepository = new UserRepository();

  it('should throw ApiError.NotFound when user does not exist', async () => {
    // Мокаем метод db.query, чтобы он возвращал пустой результат (пользователя с указанным ID нет)
    (userRepository as any)._dbConnector.db.query = jest.fn().mockResolvedValue({ rows: [] });

    // Вызываем метод getUserById с несуществующим ID
    const nonExistentUserId = 999; // такого пользователя нет

    try {
      await userRepository.getUserById(nonExistentUserId);
    } catch (error: any) {
      // Проверяем, что сообщение об ошибке содержит ожидаемый текст
      expect(error.message).toBe(`User ${nonExistentUserId} not found!`);
    }
  });
});
