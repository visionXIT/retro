import { LoginType } from '../types/types';
import { of } from 'rxjs';
import { AuthController } from '../auth/auth.controller';

describe('AuthController', () => {
  let authController: AuthController;

  // Создаем заглушки для зависимостей
  const authService = {
    login: jest.fn(),
  };
  const jwtService = {
    generateTokens: jest.fn(),
  };

  beforeEach(() => {
    authController = new AuthController(authService as any, jwtService as any);
  });

  it('should handle incorrect password', async () => {
    // Подготовьте тестовые данные для входа
    const loginInfo: LoginType = {
      email: 'test@example.com',
      login: 'testuser',
      password: 'incorrectpassword', // Указываем неверный пароль
    };
  
    // Мокаем authService.login, чтобы вернуть ошибку с сообщением "Incorrect password"
    const errorMessage = 'Incorrect password';
    authService.login.mockReturnValue(
      of(new Error(errorMessage))
    );
  
  // Вызовите метод login контроллера
  const result = await authController.login(loginInfo);

  // Проверьте, что сообщение об ошибке содержит ожидаемый текст
  if ('message' in result) {
    expect(result.message).toContain('Incorrect password');
  } else {
    fail('Expected a message in the result');
  }
  });
  
  it('should handle incorrect or non-existent login', async () => {
    // Подготовьте тестовые данные для входа
    const loginInfo: LoginType = {
      email: 'newuser22@example.com',
      login: 'newuser22@example.com', // Указываем несуществующий логин
      password: 'testpassword',
    };
  
    // Мокаем authService.login, чтобы вернуть ошибку с сообщением "User not found"
    const errorMessage = 'User not found';
    authService.login.mockReturnValue(
      of(new Error(errorMessage))
    );
  
    // Вызовите метод login контроллера
    const result = await authController.login(loginInfo);
  
    // Проверьте, что сообщение об ошибке содержит ожидаемый текст
    if ('message' in result) {
      expect(result.message).toContain('User not found');
    } else {
      fail('Expected a message in the result');
    }
  });
});



