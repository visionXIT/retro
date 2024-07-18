import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { UserRepository } from './user.repository';
import { IUser, RegisterType, UserTypeWithPassword } from '../types/types';
import { RpcErrorFilter } from 'error/api-error-rpc.filter';

@UseFilters(RpcErrorFilter)
@Controller()
export class UserController {
  constructor(private _userRepository: UserRepository) {}

  @MessagePattern('get-all-user.user')
  public async getAllUser() {
    const users = await this._userRepository.getAllUser();
    console.log(users)
    return users;
  }

  @MessagePattern('get-all-user-by-refferal-ownercode.user')
  public async getAllUserByRefferalOwnerCode(@Payload() message: { refferalOwnerCode: string }) {
    const user = await this._userRepository.getAllUserByRefferalOwnerCode(message.refferalOwnerCode);
    return user;
  }

  @MessagePattern('get-user-by-id.user')
  public async getUserById(@Payload() message: { id: number }) {
    const user: IUser = await this._userRepository.getUserById(+message.id);
    return user;
  }

  @MessagePattern('create-user.user')
  public async createUser(@Payload() message: { regObj: RegisterType; user: IUser }) {
    const { user, regObj } = message;
    const result = await this._userRepository.createUser(regObj, user);
    return result;
  }

  @MessagePattern('update-user.user')
  public async updateUser(@Payload() message: { id: number; user: IUser & UserTypeWithPassword }) {
    const { id, user } = message;
    const result = await this._userRepository.updateUserById(+id, user);
    return result;
  }

  @MessagePattern('delete-user.user')
  public async deleteUser(@Payload() message: { id: string | number }) {
    const { id } = message;

    const result = await this._userRepository.deleteUserById(+id);
    return result;
  }

  @MessagePattern('get-user-by-email-or-login.user')
  public async getUserByEmailOrLogin(@Payload() message: { email?: string; login?: string }) {
    const { email, login } = message;

    const result = await this._userRepository.getUserByEmailOrLogin(email, login);
    console.log(result)
    return result;
  }
}
