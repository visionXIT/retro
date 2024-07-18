import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthEvent } from "kafka/auth/auth.event";
import { lastValueFrom } from "rxjs";

// Этот middleware работает строго с guard'ом, который проверяет авторизацию пользователя.
// Он ничего не проверяет и не выбрасывает никакие ошибки, а только добавляет пользователя в request.
@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private _authEvent: AuthEvent) {}
    async use(request: Request & { user: any }, response: Response, next: Function) {
        const token = this._extractTokenFromHeader(request);

        if (token) {
            const jwtUser = await lastValueFrom(
                await this._authEvent.getUserAuth({ token })
            );
            request['user'] = jwtUser;
        }

        next();
    }

    private _extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}