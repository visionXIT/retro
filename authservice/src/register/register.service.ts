import { Injectable } from '@nestjs/common';
import { encryptData } from 'encrypto/encrypto';
import { ApiError } from 'error/api.error';
import { JwtService } from 'jwt/jwt.service';
import { SenderEvent, UserEvent } from 'kafka';
import { lastValueFrom } from 'rxjs';
import { EmailMessageType, RegisterType, UpdateUserParamsType, UserType } from 'types/types';

@Injectable()
export class RegistrationService {
  constructor(private _userEvent: UserEvent, private _mailSenderEvent: SenderEvent, private _jwtService: JwtService) {}

  public async register(
    regInfo: RegisterType,
    userInfo: UserType,
    emailMessage: EmailMessageType,
  ): Promise<{ message: string }> {
    this.checkValidRegisterInfo(regInfo, userInfo);

    return lastValueFrom(
      await this._userEvent.userCreateUser({
        regObj: { ...regInfo, password: encryptData(regInfo['password']) },
        user: userInfo,
      }),
    ).then(async (data) => {
      await this._mailSenderEvent.sendMessageOnEmail(emailMessage);
      return data;
    });
  }

  public async updateUser({ id, user, emailMessage }: UpdateUserParamsType) {
    return  lastValueFrom(
      await this._userEvent.updateUser({
        id,
        user,
      }),
    ).then(async (data) => {
      await this._mailSenderEvent.sendMessageOnEmail(emailMessage);
      return data;
    });
  }

  public async verifyUser(emailMessage: EmailMessageType) {
    return this._mailSenderEvent.sendMessageOnEmail(emailMessage);
  }

  private checkValidRegisterInfo(regInfo: RegisterType, userInfo: UserType) {
    if (!regInfo.email || !regInfo.password || !userInfo.address || !userInfo.role) {
      throw ApiError.NotFound('You must provide email, password, address and role');
    }
  }
}
