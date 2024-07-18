import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtService } from 'jwt/jwt.service';
import { VerificationService } from 'verification/verification.service';

@Controller()
export class KafkaAuthController {
  constructor(private _jwtService: JwtService, private _verificationService: VerificationService) {}

  @MessagePattern('get-jwt-auth.auth')
  public async getUserAuth(@Payload() message: { token: string }) {
    const { token } = message;
    const user = this._jwtService.verifyAccessToken(token);

    if (!user) {
      return null;
    }

    const isVerified = await this._verificationService.isUserVerified(user.userId)

    return {...user, isVerified};
  }
}
