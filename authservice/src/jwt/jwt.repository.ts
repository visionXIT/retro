import { Injectable } from '@nestjs/common';
import { AuthByRefreshTokenType } from '../types/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtRepository {
  constructor(private _prisma: PrismaService) {}

  public async putJwtToken(jwt_token: string, email?: string, login?: string) {
    await this._prisma.auth_table.updateMany({
      data: {
        jwt_token: jwt_token,
      },
      where: {
        email: email,
        login: login,
      },
    });
  }

  public async clearRefreshToken(refreshToken: string) {
    await this._prisma.auth_table.updateMany({
      data: {
        jwt_token: null,
      },
      where: {
        jwt_token: refreshToken,
      },
    });
  }

  public async getAuthByRefreshToken(refreshToken: string): Promise<AuthByRefreshTokenType> {
    const user = await this._prisma.auth_table.findFirst({
      select: {
        id: true,
        email: true,
      },
      where: {
        jwt_token: refreshToken,
      },
    });

    if (!user) throw new Error('User not found');

    return user;
  }
}
