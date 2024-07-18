import { UserRepository } from '../user/user.repository';
import { DBConnector } from '../db/DBConnector';
import { IUser } from '../types/types';

// Мокируем DBConnector
jest.mock('../db/DBConnector');
const mockQuery = jest.fn();

// Mock DBConnector
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an empty array when no users are found', async () => {
    // Подготавливаем фиктивные данные и ожидаемый результат
    const refferalOwnerCode = 'non_existing_code';
    const fakeUserResult: IUser[] = []; // Пустой результат запроса (нет найденных пользователей)

    // Мокируем пустой результат запроса (нет найденных пользователей)
    mockQuery.mockResolvedValueOnce({ rows: fakeUserResult });

    // Вызываем метод и ожидаем, что он вернет пустой массив
    const result = await userRepository.getAllUserByRefferalOwnerCode(refferalOwnerCode);

    // Проверяем, что результат соответствует ожиданиям (пустой массив)
    expect(result).toEqual([]);
  });
});
