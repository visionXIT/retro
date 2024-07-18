import { Injectable } from '@nestjs/common';
import jwt, { Secret } from 'jsonwebtoken';
import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_SECRET,
} from '../utils/env';
import { JwtPayloadType } from '../types/types';
import { JwtRepository } from './jwt.repository';
import { ApiError } from 'error/api.error';

@Injectable()
export class JwtService {
  constructor(private _jwtRepo: JwtRepository) {}

  public verifyUserJwt(token: string) {
    let user;

    try {
      user = jwt.verify(token, ACCESS_TOKEN_SECRET as jwt.Secret) as JwtPayloadType;
    } catch (error: unknown) {
      throw ApiError.Forbidden('Auth session exprired or incorrect');
    }
    if (!user) {
      throw ApiError.Unauthorized('Invalid access token');
    }

    return user;
  }

  public async getAccessToken(payload: JwtPayloadType): Promise<string> {
    return jwt.sign(
      {
        ...payload,
      },
      ACCESS_TOKEN_SECRET as Secret,
      { expiresIn: ACCESS_TOKEN_EXPIRATION_TIME },
    );
  }

  public async getRefreshToken(payload: JwtPayloadType): Promise<string> {
    return jwt.sign(
      {
        ...payload,
      },
      REFRESH_TOKEN_SECRET as Secret,
      { expiresIn: REFRESH_TOKEN_EXPIRATION_TIME },
    );
  }

  public async generateTokens(payload: JwtPayloadType): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.getAccessToken(payload);
    const refreshToken = await this.getRefreshToken(payload);
    this._jwtRepo.putJwtToken(refreshToken, payload.email, payload.login);

    return { accessToken, refreshToken };
  }

  public async clearToken(refreshToken: string) {
    await this._jwtRepo.clearRefreshToken(refreshToken);
  }

  public verifyRefreshToken(refreshToken: string) {
    try {
      const obj: JwtPayloadType = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET as Secret) as JwtPayloadType;
      return obj;
    } catch (err: unknown) {
      return null;
    }
  }

  public verifyAccessToken(accessToken: string) {
    try {
      const obj: JwtPayloadType = jwt.verify(accessToken, ACCESS_TOKEN_SECRET as Secret) as JwtPayloadType;
      return obj;
    } catch (err: unknown) {
      return null;
    }
  }

  public async getAuthByEmail(refreshToken: string) {
    return await this._jwtRepo.getAuthByRefreshToken(refreshToken);
  }
}
