import { UserRepository } from '../user/user.repository';

const userRepository = new UserRepository();

describe('UserRepository', () => {
  it('should successfully delete non-existing user by ID after deleting an existing user', async () => {
    const existingUserId = 1; // реальный ID существующего пользователя
    const nonExistingUserId = 9999; // Несуществующий ID пользователя

    // Удаляем сначала существующего пользователя
    await userRepository.deleteUserById(existingUserId);

    // Затем удаляем несуществующего пользователя
    const result = await userRepository.deleteUserById(nonExistingUserId);

    expect(result.message).toBe(`User was deleted ${nonExistingUserId}`);
  });
});
