import { UserRepository } from '../user/user.repository';


describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeAll(() => {
    userRepository = new UserRepository();
  });

  it('should return users when valid refferalOwnerCode is provided', async () => {
    // Подготовим фиктивные данные
    const validRefferalOwnerCode = 'validRefferalCode123';

    // Мокируем метод query для имитации работы с базой данных
    const mockQuery = jest.fn().mockResolvedValue({
      rows: [
        {
          id: 11,
          address: '123 Main St',
          role: 'user',
          refferal_code: 'ref123',
          refferal_owner_code: validRefferalOwnerCode,
        },
        {
          id: 12,
          address: '456 Elm St',
          role: 'admin',
          refferal_code: 'ref456',
          refferal_owner_code: validRefferalOwnerCode,
        },
      ],
    });

    // Заменяем метод query у DBConnector на наш мок
    (userRepository['_dbConnector'].db.query as jest.Mock) = mockQuery;

    // Вызываем метод для тестирования
    const users = await userRepository.getAllUserByRefferalOwnerCode(validRefferalOwnerCode);

    // Ожидаем, что метод вернет массив пользователей
    expect(users).toEqual([
      {
        id: 11,
        address: '123 Main St',
        role: 'user',
        refferal_code: 'ref123',
        refferal_owner_code: validRefferalOwnerCode,
      },
      {
        id: 12,
        address: '456 Elm St',
        role: 'admin',
        refferal_code: 'ref456',
        refferal_owner_code: validRefferalOwnerCode,
      },
    ]);

    // Проверяем, что метод query был вызван с ожидаемыми аргументами

const expectedQuery = `SELECT ut.id, ut.address, rt.name as role, id_refferal as refferal_code, ut.refferal_owner_code
          FROM user_table as ut
          LEFT JOIN role_table as rt ON ut.id_role = rt.id  
          LEFT JOIN refferal_table as reft ON ut.id_refferal = reft.id
          WHERE ut.is_delete = 0
          AND ut.refferal_owner_code = $1`;

// Проверяем, что метод query был вызван с ожидаемыми аргументами
expect(mockQuery).toHaveBeenCalledWith(expectedQuery, [validRefferalOwnerCode]);

  });
});







