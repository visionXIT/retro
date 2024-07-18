import { UserRepository } from '../user/user.repository';


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

  it('should throw an error if user with the same email already exists', async () => {
    // Подготавливаем фиктивные данные для регистрации пользователя
    const registrationData = {
      email: 'existinguser@example.com', // Пользователь с таким email уже существует
      login: 'newuser@example.com',
      password: 'password123',
    };

    // Подготавливаем фиктивные данные для создания пользователя
    const userData = {
      id: 10,
      refferal_code: '77',
      address: '123 Main St',
      role: 'user',
      refferal_owner_code: 'refcode123',
    };

    // Мокируем запрос и имитируем наличие пользователя с таким email
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1 }],
    }).mockResolvedValueOnce({rows: []});

    // Вызываем метод createUser и ожидаем ошибку
    
    expect(await userRepository.createUser(registrationData, userData)).toEqual(    {
      type: 'error',
      message: 'User with given email existinguser@example.com already exists!'
    });

  });
});
