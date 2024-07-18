import { Injectable } from '@nestjs/common';
import { Client, ClientKafka, Payload, Transport } from '@nestjs/microservices';
import {
  IUser,
  RegisterType,
  ReturnedUserCreateType,
  UpdatePasswordType,
  UserType,
  UserTypeWithPassword,
} from 'types/types';
import { KAFKA_SERVER_URL } from 'utils/env';

@Injectable()
export class UserEvent {
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'auth-producer',
        brokers: [KAFKA_SERVER_URL],
      },
      consumer: {
        groupId: 'user-consumer',
      },
      run: {
        autoCommit: true,
      },
    },
  })
  private _client: ClientKafka;

  async onModuleInit() {
    this._client.subscribeToResponseOf('get-user-by-email-or-login.user');
    this._client.subscribeToResponseOf('get-user-by-id.user');
    this._client.subscribeToResponseOf('create-user.user');
    this._client.subscribeToResponseOf('update-user.user');

    await this._client.connect();
  }

  async userGetUserByEmailOrLogin(@Payload() message: { email?: string; login?: string }) {
    const result = await this._client.send<UserTypeWithPassword>('get-user-by-email-or-login.user', message);
    return result;
  }

  async userGetUserById(@Payload() message: { id: number }) {
    const result = this._client.send<IUser>('get-user-by-id.user', message);

    return result;
  }

  async userCreateUser(@Payload() message: { regObj: RegisterType; user: UserType }) {
    const result = this._client.send<ReturnedUserCreateType>('create-user.user', message);

    return result;
  }

  async updateUser(@Payload() message: { id: number; user: UpdatePasswordType }) {
    const result = this._client.send<{ message: string }>('update-user.user', message);

    return result;
  }
}
