import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from 'express';
import { AuthEvent } from "kafka/auth/auth.event";
import { lastValueFrom } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private _authEvent: AuthEvent) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("User is not authorized");
    }
    const jwtUser = await lastValueFrom(
      await this._authEvent.getUserAuth({token})
    );

    if (!jwtUser) {
      throw new UnauthorizedException("User session expired");
    }

    request['user'] = jwtUser;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}