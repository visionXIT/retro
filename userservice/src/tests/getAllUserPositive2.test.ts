import { UserRepository } from '../user/user.repository';
import { DBConnector } from '../db/DBConnector';


jest.mock('../db/DBConnector');

describe('UserRepository', () => {
  it('should throw an error if the database query fails', async () => {
    const errorMessage = 'Database query failed';
    const mockQuery = jest.fn().mockRejectedValue(new Error(errorMessage));

    // Мокируем DBConnector и возвращаем объект с методом query, который бросает ошибку
    (DBConnector as jest.Mock).mockImplementation(() => ({
      db: {
        query: mockQuery,
      },
    }));

    // Создаем экземпляр UserRepository после мокирования DBConnector
    const userRepository = new UserRepository();
 
    try {
      await expect(userRepository.getAllUser()).rejects.toThrowError();
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      console.log(error.name)
      expect(error.name).toBe('Error'); // Проверяем имя ошибки
      
    }
  });
});
