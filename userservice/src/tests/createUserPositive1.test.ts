import { UserRepository } from '../user/user.repository';
import { RegisterType, IUser } from '../types/types';


describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeAll(() => {
    userRepository = new UserRepository();
  });

  it('should create a new user', async () => {
    // Подготавливаем фиктивные данные для регистрации пользователя
    const registrationData: RegisterType = {
      email: '12newuser@example.com',
      login: '12newuser@example.com',
      password: 'password123',
    };

    // Подготавливаем фиктивные данные для создания пользователя
    const userData: IUser = {
      id: 10,
      refferal_code: '77',
      address: '123 Main St',
      role: 'user',
      refferal_owner_code: 'refcode123',
    };

    // Создаем пользователя и ожидаем успешного результата
    const result = await userRepository.createUser(registrationData, userData);

    expect(result.type).toBe('success');
    expect(result.message).toBe('User success register!');
  });
  
});