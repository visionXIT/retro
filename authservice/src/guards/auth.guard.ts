import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const jwtUser = request['user'];

    if(!jwtUser) {
      throw new UnauthorizedException("User is not authorized or session expired");
    }

    if(!jwtUser.isVerified) {
      throw new UnauthorizedException("User is not verified");
    }

    return true;
  }
}