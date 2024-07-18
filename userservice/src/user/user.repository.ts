import { Injectable } from '@nestjs/common';
import { generateRandomString } from '../utils/utils';
import { IUserRepository, IUser, RegisterType, UserTypeWithPassword } from '../types/types';
import { ApiError } from 'error/api.error';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private _prisma: PrismaService) {}

  public async getAllUser(): Promise<string | IUser[]> {
    const users: IUser[] = await this._prisma
      .$queryRaw`SELECT ut.id, rt.name as role, reft.refferal_code as refferal_code, ut.refferal_owner_code
    			FROM user_table as ut
    			LEFT JOIN role_table as rt ON ut.id_role = rt.id
    			LEFT JOIN refferal_table as reft ON ut.id_refferal = reft.id
    			WHERE ut.is_delete = 0`;

    return users;
  }

  public async getAllUserByRefferalOwnerCode(refferalOwnerCode: string): Promise<IUser[]> {
    const users: IUser[] = await this._prisma
      .$queryRaw`SELECT ut.id, rt.name as role, id_refferal as refferal_code, ut.refferal_owner_code
					FROM user_table as ut
					LEFT JOIN role_table as rt ON ut.id_role = rt.id
					LEFT JOIN refferal_table as reft ON ut.id_refferal = reft.id
					WHERE ut.is_delete = 0
					AND ut.refferal_owner_code = ${refferalOwnerCode}`;

    return users;
  }

  public async createUser(regObj: RegisterType, user: IUser) {
    const existingUsersEmail = await this.getAuthIdsByEmail(regObj.email);
    const existingUsersLogin = await this.getAuthIdsByLogin(regObj.login);

    if (existingUsersEmail || existingUsersLogin) {
      throw ApiError.BadRequest(`User with given ${existingUsersEmail ? 'email' : 'login'} already exists`);
    }

    await this._prisma.auth_table.create({
      data: {
        email: regObj.email,
        login: regObj.login,
        password: regObj.password,
      },
    });

    const idAuth = await this.getAuthIdsByEmail(regObj.email);
    const idRole = (
      await this._prisma.role_table.findFirst({
        select: {
          id: true,
        },
        where: {
          name: user.role,
          is_delete: 0,
        },
      })
    )?.id;

    if (!idRole) {
      throw ApiError.BadRequest('Given role is not found');
    }

    await this._prisma.user_table.create({
      data: {
        id_role: idRole,
        id_auth: idAuth?.id,
        address: user.address,
        refferal_owner_code: user.refferal_owner_code,
      },
    });

    const userId = (
      await this._prisma.user_table.findFirst({
        select: {
          id: true,
        },
        where: {
          id_auth: idAuth?.id,
        },
      })
    )?.id;

    await this._prisma.refferal_table.create({
      data: {
        id_user: userId,
        refferal_code: generateRandomString(45),
      },
    });

    return { message: `User success register!` };
  }

  public async getUserById(id: number, typeQuery = 'client'): Promise<IUser> {
    if (typeQuery === 'insideDiagnostic') {
      const userDiagnostic = await this._prisma.user_table.findUnique({
        select: {
          id: true,
          id_role: true,
          id_refferal: true,
        },
        where: {
          id: id,
          is_delete: 0,
        },
      });
      if (!userDiagnostic) {
        throw ApiError.NotFound(`User ${id} not found!`);
      }

      return {
        id: userDiagnostic.id,
        role: String(userDiagnostic.id_role),
        refferal_code: String(userDiagnostic.id_refferal),
        refferal_owner_code: null,
      };
    }

    const user: IUser = await this._prisma
      .$queryRaw`SELECT ut.id, rt.name as role, id_refferal as refferal_code, ut.refferal_owner_code
					FROM user_table as ut
					LEFT JOIN role_table as rt ON ut.id_role = rt.id
					LEFT JOIN refferal_table as reft ON ut.id_refferal = reft.id
					WHERE ut.is_delete = 0 and ut.id = ${id}`;

    if (!user) {
      throw ApiError.NotFound(`User ${id} not found!`);
    }

    return user;
  }

  public async updateUserById(id: number, user: IUser & UserTypeWithPassword) {
    const prevUser = await this.getUserById(id, 'insideDiagnostic');
    const authIdFirst = await this.getAuthIdsByEmail(user.email);
    const authIdSecond = await this.getAuthIdsByLogin(user.login);
    // if (!authIdSecond) {
    //   throw ApiError.NotFound('User is not found!');
    // }

    const idRefferalCode =
      (
        await this._prisma.refferal_table.findFirst({
          select: {
            id: true,
          },
          where: {
            id_user: id,
          },
        })
      )?.id ?? prevUser.refferal_code;

    const role = await this._prisma.role_table.findFirst({
      where: {
        name: user.role,
        is_delete: 0,
      },
      select: {
        id: true,
      },
    });

    if (!role) {
      throw ApiError.BadRequest('Role with given name does not exist');
    }
    const idRole = +role.id;

    await this._prisma.user_table.update({
      data: {
        id_role: idRole,
        id_refferal: +idRefferalCode,
      },
      where: {
        id: id,
      },
    });

    await this._prisma.auth_table.update({
      data: {
        email: user.email,
        password: user.password,
        login: user.login,
      },
      where: {
        id: authIdFirst?.id ?? authIdSecond?.id,
      },
    });

    return { message: `User data was updated ${user.email}!` };
  }

  public async deleteUserById(id: number) {
    await this._prisma.user_table.update({
      data: {
        is_delete: 1,
      },
      where: {
        id: id,
      },
    });

    return { message: `User was deleted!` };
  }

  public async getUserByEmailOrLogin(email?: string, login?: string): Promise<UserTypeWithPassword> {
    const user: UserTypeWithPassword = (
      await this._prisma.$queryRaw<
        any[]
      >`SELECT at.email as email, at.password as password, rt.name as role, at.login as login, ut.id as id
					FROM auth_table as at
					LEFT JOIN user_table as ut ON ut.id_auth = at.id
					LEFT JOIN role_table as rt ON rt.id = ut.id_role
					WHERE at.login = ${login} or at.email = ${email}`
    )[0];

    if (!user) {
      throw ApiError.NotFound('User is not found!');
    }

    return user;
  }

  private async getAuthIdsByEmail(email: string): Promise<{ id: number } | undefined> {
    const user = await this._prisma.auth_table.findFirst({
      select: {
        id: true,
      },
      where: {
        email: email,
      },
    });

    if (user) {
      return user;
    }
  }

  private async getAuthIdsByLogin(login: string): Promise<{ id: number } | undefined> {
    const user = await this._prisma.auth_table.findFirst({
      select: {
        id: true,
      },
      where: {
        login: login,
      },
    });

    if (user) {
      return user;
    }
  }
}
