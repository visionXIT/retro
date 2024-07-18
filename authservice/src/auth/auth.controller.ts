import { Body, Controller, Post, Put, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '../jwt/jwt.service';
import { AuthService } from './auth.service';
import { JwtPayloadType, LoginType } from 'types/types';
import { ErrorFilter } from 'error/api-error-http.filter';
import { ApiError } from 'error/api.error';
import { VerificationService } from 'verification/verification.service';
import { AuthGuard } from 'guards/auth.guard';

@UseFilters(ErrorFilter)
@Controller('/auth')
export class AuthController {
  constructor(private _authService: AuthService, private _jwtService: JwtService, private _verificationService: VerificationService) {}

  @Post('/refresh')
  public async refresh(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) throw ApiError.Forbidden('Cannot refresh tokens without user session');

    const payload = this._jwtService.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw ApiError.Forbidden('Incorrect refresh token');
    }

    const user = await this._jwtService.getAuthByEmail(refreshToken);

    if (!user || user.email !== payload.email) {
      throw ApiError.Forbidden('Incorrect refresh token');
    }

    const tokens = await this._jwtService.generateTokens({
      email: payload.email!,
      login: payload.login,
      userId: payload.userId,
      role: payload.role,
    });

    const isVerified = await this._verificationService.isUserVerified(payload.userId);

    const userData = await this._authService.getUserData(payload.email, payload.login);

    response.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return {
      ...tokens,
      user: {
        email: userData.email!,
        login: userData.login,
        role: userData.role,
        userId: userData.id,
        isVerified
      },
    };
  }

  @UseGuards(AuthGuard)
  @Put('/logout')
  public async logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) throw ApiError.Forbidden('Cannot logout without user session');

    await this._jwtService.clearToken(refreshToken);
    response.clearCookie('refreshToken');
  }

  @Post('/login')
  public async login(
    @Body()
    message: LoginType,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result$ = await this._authService.login(message, (payload: JwtPayloadType) =>
      this._jwtService.generateTokens({ ...payload }).then((data) => data),
    );
    response.cookie('refreshToken', result$.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    
    return result$;
  }
}
