import { UserRepository } from '../user/user.repository';
import { DBConnector } from '../db/DBConnector';
import { IUser } from '../types/types';


jest.mock('../db/DBConnector');

describe('UserRepository', () => {
  it('should return an empty array if there are no users', async () => {
    const emptyResult: IUser[] = [];

    const mockQuery = jest.fn().mockResolvedValue({ rows: emptyResult });

    // Мокируем DBConnector и возвращаем объект с методом query, который успешно возвращает пустой результат
    (DBConnector as jest.Mock).mockImplementation(() => ({
      db: {
        query: mockQuery,
      },
    }));

    // Создаем экземпляр UserRepository после мокирования DBConnector
    const userRepository = new UserRepository();

    // Ожидаем, что метод getAllUser вернет пустой массив, так как пользователей нет
    const result = await userRepository.getAllUser();
    expect(result).toEqual(emptyResult);
  });
});
