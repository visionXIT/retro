import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from 'error/api.error';
import { JwtService } from 'jwt/jwt.service';
import { VerificationService } from 'verification/verification.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private _jwtService: JwtService, private _verificationService: VerificationService) { }

    async use(req: Request & { user: any }, res: Response, next: NextFunction) {
        const token = this._extractTokenFromHeader(req);

        if (token) {
            const jwtUser = this._jwtService.verifyUserJwt(token);
            const user = { ...jwtUser, isVerified: await this._verificationService.isUserVerified(jwtUser.userId) };
            req['user'] = user;
        }

        next();
    }

    private _extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
