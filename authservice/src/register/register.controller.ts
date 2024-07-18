import { Body, Controller, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AuthController } from 'auth/auth.controller';
import { decryptData, encryptData } from 'encrypto/encrypto';
import { ErrorFilter } from 'error/api-error-http.filter';
import { ApiError } from 'error/api.error';
import { UserEvent } from 'kafka';
import { lastValueFrom } from 'rxjs';
import { RegisterType, UserType } from '../types/types';
import { RegistrationService } from './register.service';
import * as console from 'console';
import { JwtPayload } from 'jsonwebtoken';
import { JwtRepository } from '../jwt/jwt.repository';
import { JwtService } from '../jwt/jwt.service';
import { Request, response, Response } from 'express';
import { registerAccountTemplate, updateEmailTemplate, updateLoginTemplate, updatePasswordTemplate } from 'mail-templates/mail-templates';
import { AuthGuard } from 'guards/auth.guard';

@UseFilters(ErrorFilter)
@Controller('/auth')
export class RegistrationController {
  constructor(
    private _regService: RegistrationService,
    private _userEvent: UserEvent,
    private _auth: AuthController,
    private _jwtRepo: JwtService,
  ) {}

  @Post('/register')
  public async register(@Body() message: { regInfo: RegisterType; userInfo: UserType }): Promise<{ message: string }> {
    const { regInfo, userInfo } = message;
    const { login, password } = regInfo;

    try {
      const existingLogin = await lastValueFrom(
        await this._userEvent.userGetUserByEmailOrLogin({ login: regInfo.login }),
      );
      const existingEmail = await lastValueFrom(
        await this._userEvent.userGetUserByEmailOrLogin({ email: regInfo.email }),
      );

      if (existingLogin.length || existingEmail.length) {
        throw ApiError.BadRequest(`User with this login or email already exists!`);
      }
    } catch (error: unknown) {
      const { status, message } = error as { status: number; message: string };

      if (
        !(
          message === 'User is not found!' ||
          message === 'Incorrect login or email!' ||
          message === ('Not found user!' as string)
        )
      ) {
        throw new ApiError(status, message);
      }
    }

    return await this._regService.register(regInfo, userInfo, {
      email: regInfo.email!,
      subject: 'Добро пожаловать!',
      text: registerAccountTemplate({login: login ?? regInfo.email!, password}),
      typeMessage: 'register',
    });
  }

  @UseGuards(AuthGuard)
  @Post('/updatePassword')
  public async updatePassword(
    @Req() req: Request,
    @Body() message: { regObj: RegisterType },
    @Res() response: Response
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      role: 'user' | 'manager';
      login?: string | undefined;
      email?: string | undefined;
      userId: number;
    };
  }> {
    const { password, email, login } = message.regObj;
    const { authorization } = req.headers;
    const token = authorization?.split(' ')[1];
    const isTokenValid = await this.checkValidJwtToken(token!, email!);
    if (!isTokenValid) {
      throw ApiError.BadRequest('Token is not valid');
    }
    const userWithPassword = await lastValueFrom(
      await this._userEvent.userGetUserByEmailOrLogin(email ? { email } : login !== undefined ? { login } : {}),
    );
    const userFromTableUser = await lastValueFrom(await this._userEvent.userGetUserById({ id: userWithPassword.id }));

    return await this._regService
      .updateUser({
        id: userWithPassword.id,
        user: {
          ...userWithPassword,
          ...userFromTableUser,
          password: encryptData(password),
        },
        emailMessage: {
          email: [userWithPassword.email!],
          subject: 'Ваш пароль изменён!',
          text: updatePasswordTemplate({login: userWithPassword.login!, password: password}),
          typeMessage: 'update-password',
        },
      })
      .then(async () => {
        const autoLogin = await this._reLoginUserWithNewData(
          { 
            ...(email ? { email } : { login }),
            password,
            response
          }
        );
        return autoLogin;
      });
  }

  @Post('/forgotPassword')
  public async forgotPassword(
    @Body() message: { email: string },
    @Res() response: Response
  ) {
    const { email } = message;
    const newPassword = this._generatePassword();
    try {
      const userWithPassword = await lastValueFrom(await this._userEvent.userGetUserByEmailOrLogin({ email: email }));

      if (!(userWithPassword.email === email)) {
        throw ApiError.BadRequest('Email incorrect!');
      }

      if (!userWithPassword) {
        throw ApiError.NotFound(`This email not found! You need registration!`);
      }

      const userFromTableUser = await lastValueFrom(await this._userEvent.userGetUserById({ id: userWithPassword.id }));

      try {
        await this._regService.updateUser({
          id: userWithPassword.id,
          user: {
            ...userWithPassword,
            ...userFromTableUser,
            password: encryptData(newPassword),
          },
          emailMessage: {
            email: [userWithPassword.email!],
            subject: 'Новый пароль',
            text: updatePasswordTemplate({login: userWithPassword.login!, password: newPassword}),
            typeMessage: 'replace-password',
          },
        });
      } catch (error) {
        console.log(error);
      }

      const autoLogin = await this._reLoginUserWithNewData({
        email,
        password: newPassword,
        response
      });

      return autoLogin;
    } catch (error) {
      console.log();
    }
  }

  @UseGuards(AuthGuard)
  @Post('/updateLogin')
  public async updateLogin(
    @Req() req: Request, 
    @Body() message: { email?: string; newLogin: string },
    @Res() response: Response
  ) {
    const { email, newLogin } = message;
    const { authorization } = req.headers;
    const token = authorization?.split(' ')[1];
    const isTokenValid = await this.checkValidJwtToken(token!, email!);

    if (!isTokenValid) {
      throw ApiError.BadRequest('Token is not valid');
    }
    try {
      const existingLogin = await lastValueFrom(await this._userEvent.userGetUserByEmailOrLogin({ login: newLogin }));

      if (existingLogin?.login === newLogin) {
        throw ApiError.BadRequest(`User with this login already exists!`);
      }
    } catch (error: unknown) {
      const { status, message } = error as { status: number; message: string };

      if (!(message === 'User is not found!' || message === ('Not found user!' as string))) {
        throw new ApiError(status, message);
      }
    }

    const userWithPassword = await lastValueFrom(await this._userEvent.userGetUserByEmailOrLogin({ email }));

    if (!userWithPassword) {
      throw ApiError.NotFound(`This user not found! You need registration!`);
    }
    const userFromTableUser = await lastValueFrom(await this._userEvent.userGetUserById({ id: userWithPassword.id }));
    try {
      await this._regService.updateUser({
        id: userWithPassword.id,
        user: {
          ...userWithPassword,
          ...userFromTableUser,
          login: newLogin,
        },
        emailMessage: {
          email: [userWithPassword.email!],
          subject: 'Мы изменили Ваш логин!',
          text: updateLoginTemplate({login: newLogin, password: '********'}),
          typeMessage: 'update-login',
        },
      });
    } catch (error) {
      console.log(error);
    }

    const autoLogin = await this._reLoginUserWithNewData({
      email,
      password: userWithPassword.password,
      isCrypto: true,
      response
    });

    return autoLogin;
  }


  @UseGuards(AuthGuard)
  @Post('/updateEmail')
  public async updateEmail(
    @Req() req: Request,
    @Body() message: { email: string; newEmail: string },
    @Res({passthrough: true}) response: Response
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      role: 'user' | 'manager';
      login?: string | undefined;
      email?: string | undefined;
      userId: number;
    };
  }> {
    const { email, newEmail } = message;

    const { authorization } = req.headers;
    const token = authorization?.split(' ')[1];
    const isTokenValid = await this.checkValidJwtToken(token!, email!);
    if (!isTokenValid) {
      throw ApiError.BadRequest('Token is not valid');
    }

    try {
      const existingUsersEmail = await lastValueFrom(
        await this._userEvent.userGetUserByEmailOrLogin({ email: newEmail }),
      );

      if (existingUsersEmail?.email === newEmail) {
        throw ApiError.BadRequest(`User with this email already exists!`);
      }
    } catch (error: unknown) {
      const { status, message } = error as { status: number; message: string };

      if (
        !(message === 'User is not found!' || message === 'Incorrect login or email!' || message === 'Not found user!')
      ) {
        throw new ApiError(status, message);
      }
    }

    const userWithPassword = await lastValueFrom(await this._userEvent.userGetUserByEmailOrLogin({ email }));

    if (!userWithPassword) {
      throw ApiError.NotFound(`This user not found! You need registration!`);
    }

    const userFromTableUser = await lastValueFrom(await this._userEvent.userGetUserById({ id: userWithPassword.id }));

    try {
      await this._regService.updateUser({
        id: userWithPassword.id,
        user: {
          ...userWithPassword,
          ...userFromTableUser,
          email: newEmail,
        },
        emailMessage: {
          email: [userWithPassword.email!, newEmail],
          subject: 'Мы изменили Вашу почту!',
          text: updateEmailTemplate({login: newEmail, password: "********"}),
          typeMessage: 'update-login',
        },
      });
    } catch (error) {
      console.log(error);
    }

    const autoLogin = await this._reLoginUserWithNewData({
      email: newEmail,
      password: userWithPassword.password,
      isCrypto: true,
      response
    });

    return autoLogin;
  }

  private _generatePassword(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async _reLoginUserWithNewData({
    password,
    email,
    login,
    isCrypto,
    response
  }: {
    password: string;
    email?: string;
    login?: string;
    isCrypto?: boolean;
    response: Response
  }) {
    let passwordCorrect = password;

    if (isCrypto) {
      const passwordTemp = decryptData(password);
      passwordCorrect = passwordTemp.slice(1, passwordTemp.length - 1);
    }

    const autoLogin = await this._auth.login(
      email
        ? {
            email: email,
            password: passwordCorrect,
          }
        : {
            login: login,
            password: passwordCorrect,
          },
      response
    );

    return autoLogin;
  }

  private async checkValidJwtToken(token: string, email: string) {
    const user = this._jwtRepo.verifyUserJwt(token);
    if (!(user.email === email)) {
      return false;
    }
    return true;
  }
}
