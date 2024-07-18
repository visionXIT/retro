import { UserRepository } from '../user/user.repository';
import { DBConnector } from '../db/DBConnector';


describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
  });

  it('should throw an error when an invalid refferalOwnerCode is provided', async () => {
    const invalidRefferalOwnerCode = 'invalidCode123';

    try {
      await userRepository.getAllUserByRefferalOwnerCode(invalidRefferalOwnerCode);
    } catch (error: any) {
      expect(error.status).toBe(400); // Ожидаем статус ошибки 400 Bad Request
      expect(error.message).toBe('Invalid refferalOwnerCode'); // Ожидаем сообщение об ошибке
    }
  });
});