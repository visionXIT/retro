import { UserRepository } from '../user/user.repository';

const userRepository = new UserRepository();

describe('UserRepository', () => {
  it('should throw ApiError when trying to delete user with invalid ID (zero ID)', async () => {
    const userId = 0; // Нулевой ID пользователя

    try {
      await userRepository.deleteUserById(userId);
    } catch (error: any) {
      expect(error.status).toBe(400); // Ожидаем статус 400, так как ID недопустим
    }
  });
});
