export type JwtPayloadType = {
  userId: number;
  email: string;
  role: string;
};

export type ReqUserType = {
  email: string;
  userId: number;
};

export type Promocode = {
  promocode: string;
  config: PromocodeConfig;
  usedBy: number[];
}

export type PromocodeConfig = {
  expirationTime: number;
  maxActivations: number;
  addActions: number[];
  subscribeIds: number[];
}

export type CreatePromocodeConfig = Partial<PromocodeConfig>;

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