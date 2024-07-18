import { UserRepository } from '../user/user.repository';

const userRepository = new UserRepository();

describe('UserRepository', () => {
  it('should successfully delete user by ID', async () => {
    const userId = 1; 

    const result = await userRepository.deleteUserById(userId);

    expect(result.message).toEqual("User was deleted 1");
  });
});
