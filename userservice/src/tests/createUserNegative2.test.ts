import { UserRepository } from '../user/user.repository';
import { RegisterType, IUser } from '../types/types';

// Создаем мок для DBConnector
jest.mock('../db/DBConnector');
const mockQuery = jest.fn();

// Имитируем DBConnector
const { DBConnector } = require('../db/DBConnector');
(DBConnector as jest.Mock).mockImplementation(() => ({
  db: {
    query: mockQuery,
  },
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
  });

  it('should throw an error if user with the same email already exists and role is not found', async () => {
    // Подготавливаем фиктивные данные для регистрации пользователя
    const registrationData = {
      email: 'existinguser2332222@example.com',
      login: 'existinguser2332222@example.com',
      password: 'password123',
    };

    // Подготавливаем фиктивные данные для создания пользователя
    const userData = {
      id: 10,
      refferal_code: '77',
      address: '123 Main St',
      role: 'nonexistent_role', // Роль, которой не существует
      refferal_owner_code: 'refcode123',
    };

    // Мокируем запрос и имитируем наличие пользователя с таким email и отсутствие роли
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1 }],
    });
    mockQuery.mockResolvedValueOnce({
      rows: [],
    });

    // Вызываем метод createUser и ожидаем ошибку
    try {
      await userRepository.createUser(registrationData, userData);
    } catch (error: any) {
      expect(error.message).toBe('User with given email already exists');
    }
  });
});