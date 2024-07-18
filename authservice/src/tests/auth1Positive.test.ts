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

  it('should authenticate a user', async () => {
    // Подготовьте тестовые данные для входа
    const loginInfo: LoginType = {
      email: 'newuser@example.com',
      login: 'newuser@example.com',
      password: 'testpassword',
    };
  
    // Мокаем authService.login, чтобы вернуть заранее определенное значение
    authService.login.mockReturnValue(
      of({
        userId: '123',
        email: loginInfo.email,
        login: loginInfo.login,
        role: 'user',
      })
    );
  
    // Мокаем jwtService.generateTokens, чтобы вернуть заранее определенное значение
    jwtService.generateTokens.mockResolvedValue({
      accessToken: 'fakeAccessToken',
      refreshToken: 'fakeRefreshToken',
    });
  
    // Вызовите метод login контроллера
    const result = await authController.login(loginInfo);

    expect(result).toEqual({
      userId: '123',
      email: loginInfo.email,
      login: loginInfo.login,
      role: 'user',
    });
  });
});



