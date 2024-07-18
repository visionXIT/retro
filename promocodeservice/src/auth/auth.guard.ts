import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from 'express';
import { AuthEvent } from "kafka/auth/auth.event";
import { lastValueFrom } from "rxjs";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private _authEvent: AuthEvent,     
    private reflector: Reflector
  ) {}

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

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles?.length && !requiredRoles.includes(jwtUser.role)) {
      throw new ForbiddenException("User has not enough permissions");
    }

    request['user'] = jwtUser;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}