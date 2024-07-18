import { UserRepository } from '../user/user.repository';
import { IUser, UserTypeWithPassword } from '../types/types';


describe('UserRepository', () => {
  // Создаем экземпляр UserRepository
  const userRepository = new UserRepository();

  it('should return a user by email when the user exists', async () => {
    // Замените emailValue на существующий в вашей базе данных адрес электронной почты
    const emailValue = 'newuser@example.com';

    // Вызываем метод getUserByEmail с существующим email
    const user: UserTypeWithPassword = await userRepository.getUserByEmailOrLogin(emailValue);

    // Проверяем, что метод вернул объект пользователя
    expect(user).toBeDefined();

    // Проверяем, что у пользователя есть ожидаемые свойства
    expect(user.email).toBe(emailValue);
    expect(user.userId).toBeDefined(); // Предполагается, что свойство userId определено
    expect(user.role).toBeDefined(); // Предполагается, что свойство role определено
    expect(user.password).toBeDefined(); // Предполагается, что свойство password определено
  });

});
