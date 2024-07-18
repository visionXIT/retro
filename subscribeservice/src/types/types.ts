import { Pool } from 'pg';

export type OnSubscribeType = {
  subscribeId: number;
  numActions: number;
};

export type SubscribeType = {
  id: number;
  name: string;
  actionCost: number;
  state: SubscribeStateType[];
  actionsLimit: number;
  actionsUsed: number;
};

export type SubscribeStateType = {
  actions: number;
  wallet: string;
};

export type AddWalletsType = {
  subscribeId: number;
  wallet: string;
};

export interface ISubscribeService {
  addWalletsToSubscribe: (userId: number, subscribeInfo: AddWalletsType) => Promise<void>;
  subscribeUser: (userId: number, subscribeInfo: OnSubscribeType) => Promise<SubscribeType>;
  checkUserSubscribed: (userId: number) => Promise<boolean>;
  getSubscribesByUserId: (userId: number) => Promise<SubscribeType[]>;
  getSubscribeByUserAndSubscribeId: (userId: number, subscribeId: number) => Promise<SubscribeType>;
  getSubscribeIdByName: (subscribeName: string) => Promise<{ id: number; coastOneAction: number }>;
  getBalanceOnSubscribe: (subscribeId: number, userId: number) => Promise<number>;
}

export interface ISubscribeRepository {
  addWalletsToSubscribe: (wallets: string, userId: number, subscribeId: number) => Promise<void>;
  subscribeUser: (userId: number, subscribeInfo: OnSubscribeType) => Promise<void>;
  checkSubscribeId: (id: number) => Promise<boolean>;
  checkUserSubscribed: (userId: number) => Promise<boolean>;
  clearUserSubscribes: (userId: number, subscribeId: number) => Promise<void>;
  getUserSubscribeActionsById: (
    subscribeId: number,
    userId: number,
  ) => Promise<{ actionsLimit: number; actionsUsed: number; id: number } | null>;
  getSubscribesByUserId: (userId: number) => Promise<SubscribeType[]>;
  getSubscribeByUserAndSubscribeId: (userId: number, subscribeId: number) => Promise<SubscribeType>;
  getSubscribeIdByName: (subscribeName: string) => Promise<{ id: number; coastOneAction: number }>;
  getBalanceOnSubscribe: (subscribeId: number, userId: number) => Promise<number>;
}

export interface IDBConnector {
  db: Pool;
}

export type JwtPayloadType = {
  userId: number;
  email: string;
  role: string;
};

export type ReqUserType = {
  email: string;
  userId: number;
};
