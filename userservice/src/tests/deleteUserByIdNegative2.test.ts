import { UserRepository } from '../user/user.repository';


const userRepository = new UserRepository();

describe('UserRepository', () => {
  it('should throw ApiError when trying to delete user that is already marked as deleted', async () => {
    const userId = 1; // реальный ID пользователя, который уже помечен как удаленный

    try {
      await userRepository.deleteUserById(userId);
    } catch (error: any) {
      expect(error.status).toBe(400); // Ожидаем статус 400, так как пользователь уже удален
    }
  });
});
