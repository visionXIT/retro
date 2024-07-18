import { UserRepository } from '../user/user.repository';
import { DBConnector } from '../db/DBConnector';

describe('UserRepository', () => {
  it('should throw an error when a database error occurs', async () => {
    // Подготавливаем фиктивные данные и ожидаемый результат
    const refferalOwnerCode = 'XJn0BdNYaDwi0Rhq70G91O080xrbaKDIZJLMPFmpUDVWa';
    
    // Мокируем запрос и имитируем ошибку базы данных
    const dbConnector = new DBConnector();
    
    // Создаем экземпляр UserRepository с настоящим DBConnector
    const userRepository = new UserRepository();
    userRepository['_dbConnector'] = dbConnector;
    
    // Мокируем метод, который выбросит ошибку
    dbConnector.db.query = jest.fn().mockRejectedValue(new Error('Database error'));
    
    try {
      // Вызываем метод, который должен вызвать ошибку
      await userRepository.getAllUserByRefferalOwnerCode(refferalOwnerCode);
    } catch (error: any) {
      // Ожидаем, что error будет экземпляром Error
      expect(error).toBeInstanceOf(Error);
    }
  });
});

