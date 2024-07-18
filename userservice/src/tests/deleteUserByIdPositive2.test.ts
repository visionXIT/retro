import { UserRepository } from '../user/user.repository';

const userRepository = new UserRepository();

describe('UserRepository', () => {
  it('should successfully delete non-existing user by ID', async () => {
    const userId = 9999; // Несуществующий ID пользователя

    const result = await userRepository.deleteUserById(userId);

    expect(result.message).toBe(`User was deleted ${userId}`);
  });
});
