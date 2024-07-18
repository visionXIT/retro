import { UserRepository } from '../user/user.repository';
import { DBConnector } from '../db/DBConnector';



describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeAll(() => {
    // Создаем экземпляр UserRepository
    userRepository = new UserRepository();
  });

  it('should throw NotFound error when refferalOwnerCode does not exist', async () => {
    // Неправильный refferalOwnerCode, который не существует в базе данных
    const invalidRefferalOwnerCode = 'nonexistentCode';

        // Мокируем запрос и имитируем ошибку базы данных
    const dbConnector = new DBConnector();
    
        // Создаем экземпляр UserRepository с настоящим DBConnector
    const userRepository = new UserRepository();
    userRepository['_dbConnector'] = dbConnector;
        
        // Мокируем метод, который выбросит ошибку
    dbConnector.db.query = jest.fn().mockRejectedValue(new Error('Given refferalOwnerCode is not found'));

    try {
      // Вызываем метод с неправильным refferalOwnerCode
      await userRepository.getAllUserByRefferalOwnerCode(invalidRefferalOwnerCode);
      
      // Если метод не выбросил ошибку, делаем тест неудачным
      fail('Expected an error but did not receive one.');
    } catch (error: any) {
    
      // Проверяем, что сообщение об ошибке соответствует ожиданиям
      expect(error.message).toBe('Given refferalOwnerCode is not found');
    }
  });
});
