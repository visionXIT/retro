import { UserRepository } from '../user/user.repository';
import { DBConnector } from '../db/DBConnector';


jest.mock('../db/DBConnector');

describe('UserRepository', () => {
  it('should throw an error when the database query fails', async () => {
    const errorMessage = 'Database query failed';
    const mockQuery = jest.fn().mockRejectedValue(new Error(errorMessage));

    // Мокируем DBConnector и возвращаем объект с методом query, который будет бросать ошибку
    (DBConnector as jest.Mock).mockImplementation(() => ({
      db: {
        query: mockQuery,
      },
    }));

    const userRepository = new UserRepository();

    // Ожидаем, что метод бросит ошибку "Database query failed" из-за сбоя в базе данных
    
    try {
      await expect(userRepository.getAllUser()).rejects.toThrowError();
    } catch (error: any) {
      
      expect(error.name).toBe('Database query failed'); // Проверяем текст ошибки
    }
  });
});
