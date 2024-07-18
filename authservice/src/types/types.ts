import { Pool } from 'pg';

export interface IUser {
  id: number;
  role: 'user' | 'manager';
  refferal_code: string;
  refferal_owner_code: string | null;
}

export type EmailMessageType = {
  email: string | string[];
  subject: string;
  text: string;
  typeMessage: 'update-password' | 'register' | 'replace-password' | 'update-login' | 'update-email' | 'user-verification';
};

export type UpdateUserParamsType = {
  id: number;
  user: UpdatePasswordType;
  emailMessage: EmailMessageType;
  bearerToken?: string;
};

export interface IRegistrationController {
  register: () => Promise<void>;
}

export interface IAuthController {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface IDBConnector {
  db: Pool;
}

export type RegisterType = {
  [key: string]: string | (string | undefined);
  email?: string;
  login?: string;
  password: string;
};

export type JwtPayloadType = {
  userId: number;
  login?: string;
  email?: string;
  role: 'user' | 'manager';
};

export type UpdatePasswordType = {
  id: number;
  email?: string;
  login?: string;
  password: string;
  role: 'user' | 'manager';
  refferal_code: string;
  refferal_owner_code: string | null;
};

export type VerificationDataType = {
  confirmCode?: string | null;
  expireConfirmCode?: Date | null;
  isConfirmed?: boolean;
}

export type AuthByRefreshTokenType = Pick<IUser, 'id'> & Pick<RegisterType, 'email'>;

export type LoginType = RegisterType;

export type UserType = Pick<IUser, 'role' | 'refferal_owner_code'> & {
  address: string;
};

export type UserTypeWithPassword = RegisterType & Pick<IUser, 'role' | 'id'>;

export type UserWithPasswordParamsUpdateType = RegisterType;

export type ReturnedUserCreateType = { message: string };
