import { Pool } from 'pg';
import { OnModuleDestroy } from '@nestjs/common';
import { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } from '../utils/env';
import { IDBConnector } from '../types/types';

export class DBConnector implements IDBConnector, OnModuleDestroy {
  public db: Pool;

  constructor() {
    this.db = new Pool({
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
      database: DB_DATABASE,
      max: 100,
    });
  }
  async onModuleDestroy() {
    await this.db.end();
  }
}
