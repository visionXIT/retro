import { UserRepository } from '../user/user.repository';
import { DBConnector } from '../db/DBConnector';

describe('UserRepository', () => {
  it('should throw an error when the database query fails with an unexpected error', async () => {
    // Подключаемся к настоящей базе данных
    const dbConnector = new DBConnector();

    // Создаем экземпляр UserRepository с настоящим DBConnector
    const userRepository = new UserRepository();
    userRepository['_dbConnector'] = dbConnector;
    
    try {
      // Вызываем метод, который должен вызвать ошибку
      await userRepository.getAllUser();
    } catch (error: any) {

      // Ожидаем, что статус ошибки будет 500
      expect(error.status).toBe(500);
    }
  });
});
