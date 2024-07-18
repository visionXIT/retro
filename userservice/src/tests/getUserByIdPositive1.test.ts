import { UserRepository } from '../user/user.repository';
import { IUser } from '../types/types';

describe('UserRepository', () => {
  // Создаем экземпляр UserRepository
  const userRepository = new UserRepository();

  // Предположим, что у нас есть фейковый пользователь для теста
  const fakeUser: IUser = {
    id: 1,
    address: 'Fake Address',
    role: '1',
    refferal_code: 'fake_code',
    refferal_owner_code: 'fake_owner_code',
  };

  it('should return user by ID', async () => {
    // Мокаем метод db.query, чтобы он возвращал фейкового пользователя
    (userRepository as any)._dbConnector.db.query = jest.fn().mockResolvedValue({ rows: [fakeUser] });

    // Вызываем метод getUserById с ID фейкового пользователя
    const userId = 1;
    const user = await userRepository.getUserById(userId);

    // Проверяем, что результат соответствует фейковому пользователю
    expect(user).toEqual(fakeUser);
  });
});
