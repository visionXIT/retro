import { Pool } from 'pg';

export interface IUser {
  id: number;
  role: string;
  refferal_code: string;
  refferal_owner_code: string | null;
  address?: string;
}

export interface IDBConnector {
  db: Pool;
}

export type UserTypeWithPassword = RegisterType & Pick<IUser, 'role' | 'id'>;

export interface IUserRepository {
  createUser: (regObj: RegisterType, user: IUser) => Promise<{ message: string }>;
  getAllUser: () => Promise<IUser[] | string>;
  getAllUserByRefferalOwnerCode: (refferalOwnerCode: string) => Promise<IUser[]>;
  getUserByEmailOrLogin: (email: string) => Promise<UserTypeWithPassword>;
  getUserById: (id: number) => Promise<IUser>;
  updateUserById: (id: number, user: IUser & UserTypeWithPassword) => Promise<{ message: string }>;
  deleteUserById: (id: number) => Promise<{ message: string }>;
}

export type RegisterType = {
  email: string;
  login: string;
  password: string;
};
