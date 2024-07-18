import { Injectable } from '@nestjs/common';
import { decryptData } from 'encrypto/encrypto';
import { UserEvent } from 'kafka';
import { lastValueFrom } from 'rxjs';
import { JwtPayloadType, LoginType } from '../types/types';
import { ApiError } from 'error/api.error';
import { VerificationService } from 'verification/verification.service';

@Injectable()
export class AuthService {
  constructor(private _userEvent: UserEvent, private _verificationService: VerificationService) {}

  public async login(
    loginInfo: LoginType,
    callback: (payload: JwtPayloadType) => Promise<{
      accessToken: string;
      refreshToken: string;
    }>,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      role: 'user' | 'manager';
      login?: string;
      email?: string;
      userId: number;
      isVerified?: boolean;
    };
  }> {
    let passwordsEq = false;
    const userAuth = await lastValueFrom(
      await this._userEvent.userGetUserByEmailOrLogin({
        email: loginInfo.email,
        login: loginInfo.login,
      }),
    );

    if (typeof userAuth === 'string') {
      throw ApiError.BadRequest(userAuth);
    }
    const passwordTemp = decryptData(userAuth.password);
    const password = passwordTemp.slice(1, passwordTemp.length - 1);

    for (let i = 0; i < password.length; i++) {
      if (password[i] !== loginInfo.password[i]) {
        break;
      }

      if (i === password.length - 1) passwordsEq = true;
    }

    if (!passwordsEq) {
      throw ApiError.BadRequest('Incorrect password!');
    }

    const isVerified = await this._verificationService.isUserVerified(userAuth.id);

    const tokens = await callback({
      userId: userAuth.id,
      login: userAuth.login,
      email: userAuth.email,
      role: userAuth.role,
    });

    return {
      ...tokens,
      user: {
        role: userAuth.role,
        login: userAuth.login,
        email: userAuth.email,
        userId: userAuth.id,
        isVerified,
      },
    };
  }

  public async getUserData(email?: string, login?: string) {
    return lastValueFrom(await this._userEvent.userGetUserByEmailOrLogin({ email, login }));
  }
}
