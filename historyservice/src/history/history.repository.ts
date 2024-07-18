import { Injectable } from '@nestjs/common';
import { BriefHistoryType, HistoryType, IHistoryRepository, LoggerType } from 'types/types';
import { CreateHistoryDto } from './dto/create-history.dto';
import { PrismaService } from 'prisma/prisma.service';
import { JsonArray, JsonObject, JsonValue } from '@prisma/client/runtime/library';

@Injectable()
export class HistoryRepository implements IHistoryRepository {
  constructor(private readonly _prisma: PrismaService) {}

  public async getAllUserBriefHistory(userId: number): Promise<BriefHistoryType[]> {
    const result = await this._prisma.history_table.findMany({
      select: {
        id_process: true,
        subscribe_table: {
          select: {
            name: true
          }
        }
      },
      where: {
        id_user: userId,
        is_delete: 0
      }
    })

    const history = result.map((item) => {
      return {
        processId: item.id_process!,
        subscribeName: item.subscribe_table?.name!
      }
    })

    return history as BriefHistoryType[];
  }

  public async getAllUserHistory(userId: number): Promise<HistoryType[]> {
    const result = await this._prisma.history_table.findMany({
      include: {
        subscribe_table: {
          select: {
            name: true
          }
        }
      },
      where: {
        id_user: userId,
        is_delete: 0
      }
    })

    const history = result.map((item) => {
      return {
        processId: item.id_process!,
        logs: item.logs as LoggerType[],
        nameProcess: item.name_process!,
        from: item.from!,
        to: item.to!,
        amount: item.amount!,
        tokens: item.tokens!,
        options: item.options!,
        walletCount: item.wallet_count!,
        problemWalletCount: item.problem_wallet_count!,
        subscribeName: item.subscribe_table?.name!,
      };
    });

    return history as HistoryType[];
  }

  public async addHistory(log: CreateHistoryDto) {
    console.log(log);
    await this._prisma.history_table.create({
      data: {
        logs: log.logs as JsonObject[],
        id_user: log.userId,
        id_subscribe: log.subscribeId,
        id_process: log.processId,
        name_process: log.nameProcess ?? '',
        tokens: (typeof log.tokens === 'string' ? [log.tokens] : log.tokens) ?? [],
        from: (typeof log.from === 'string' ? [log.from] : log.from) ?? [],
        to: (typeof log.to === 'string' ? [log.to] : log.to) ?? [],
        amount: log.amount as string,
        wallet_count: log.walletCount ?? 0,
        problem_wallet_count: log.problemWalletCount ?? 0,
        options: log.options ?? {}
      }
    })
    console.log('addHistory => work!');
  }

  public async getHistoryByProcessId(processId: string): Promise<HistoryType> {
    const result = await this._prisma.history_table.findUnique({
      select: {
        id_process: true,
        logs: true,
        subscribe_table: {
          select: {
            name: true
          }
        }
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    })

    const log = {
      processId: result?.id_process!,
      logs: result?.logs! as LoggerType[],
      subscribeName: result?.subscribe_table?.name!
    }

    return log as HistoryType;
  }

  public async getHistoryIdByProcessId(processId: string): Promise<number> {
    const log = await this._prisma.history_table.findUnique({
      select: {
        id: true
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    })

    return log?.id!;
  }

  public async checkSubscribeId(subscribeId: number): Promise<boolean> {
    const subscribe = await this._prisma.subscribe_table.findUnique({
      select: {
        id: true
      },
      where: {
        id: subscribeId,
        is_delete: 0
      }
    })

    return subscribe ? true : false;
  }

  public async deleteHistoryByProcessId(processId: string) {
    await this._prisma.history_table.update({
      where: {
        id_process: processId,
      },
      data: {
        is_delete: 1,
      },
    })
  }
}
