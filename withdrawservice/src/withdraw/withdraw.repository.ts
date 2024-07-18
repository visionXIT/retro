import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerType } from 'types/types';
import { decryptData } from 'utils/crypto';

@Injectable()
export class WithdrawRepository {
  constructor(private readonly _prisma: PrismaService) {}

  public async createProcess(processId: string, userId: number, config: string, walletCount: number) {
    await this._prisma.withdraw_table.create({
      data: {
        status: 'disabled',
        id_process: processId,
        options: config,
        id_user: userId,
        wallet_count: walletCount,
        problem_wallet_count: 0,
      }
    })
  }

  public async changeProcessStatus(processId: string, status: string) {
    await this._prisma.withdraw_table.update({
      data: {
        status: status
      },
      where: {
        id_process: processId
      }
    })
  }

  public async getProcessStatus(processId: string) {
    const result = await this._prisma.withdraw_table.findUniqueOrThrow({
      select: {
        status: true
      },
      where: {
        id_process: processId
      }
    })

    return result.status!;
  }

  public async checkProcessById(processId: string) {
    const process = await this._prisma.withdraw_table.findFirst({
      select: {
        id: true,
      },
      where: {
        id_process: processId,
        is_delete: 0,
      },
    })

    return process != null ? true : false;
  }

  public async checkUserId(userId: number) {
    const result = await this._prisma.user_table.findFirst({
      select: {
        id: true
      },
      where: {
        id: userId,
        is_delete: 0
      }
    })

    return result?.id != null ? true : false;
  }

  public async checkUserSubscribe(userId: number) {
    const subscribe = (
      await this._prisma.$queryRaw<{ id: number }[]>`
        SELECT id
        FROM user_subscribe_table
        WHERE id_user = ${userId} AND actions_limit > actions_used AND is_delete = 0
        LIMIT 1`
    )[0];

    return subscribe != null ? true : false;
  }

  public async addProblemWallets(processId: string, problemWallets: string) {
    await this._prisma.withdraw_table.update({
      data: {
        problem_wallets: problemWallets
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    })
  }

  public async getProblemWallets(processId: string): Promise<string | undefined | null> {
    const problemWallets = (await this._prisma.withdraw_table.findUnique({
      select: {
        problem_wallets: true
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    }))?.problem_wallets;

    return problemWallets;
  }

  public async getProcessInfo(processId: string) {
    const result = await this._prisma.withdraw_table.findUniqueOrThrow({
      select: {
        id_user: true,
        options: true,
        problem_wallets: true
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    })

    const process = {
      userId: result.id_user!,
      config: result.options!,
      problemWallets: result.problem_wallets!
    }

    return process;
  }

  public async getAllProcessInfo(processId: string) {
    const process = await this._prisma.withdraw_table.findUniqueOrThrow({
      select: {
        id_user: true,
        options: true,
        wallet_count: true,
        problem_wallet_count: true,
        status: true,
        logs: true,
        create_at: true
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    })

    let config;

    try {
      config = JSON.parse(decryptData(process.options!));
    } catch (error: unknown) {
      config = null;
    }

    const logs: LoggerType[] = JSON.parse(process.logs!);

    const newlogs = logs?.map((log) => {
      return {
        messageLog: log.messageLog,
        idProcess: processId,
        userId: process.id_user,
      };
    });

    return {
      id_user: process.id_user,
      id_process: processId,
      logs: newlogs,
      problemWalletCount: process.problem_wallet_count,
      walletCount: process.wallet_count,
      statusProcess: process.status,
      createAt: process.create_at,
      options: config
        ? {
            symbol: config.ccy,
            fromNetwork: config.chain,
            toNetwork: config.chain,
            isShuffleWallet: config.isShuffleWallets,
            ecoSystem: 'zkSync',
            actionType: 'OkxWithdraw',
            delayAction: {
              minSecond: config.minDelay,
              maxSecond: config.maxDelay,
            },
            delayAmount: {
              minAmount: config.minWithdrawal,
              maxAmount: config.maxWithdrawal,
            },
          }
        : null,
    };
  }

  public async getProcessOptions(processId: string) {
    const process = await this._prisma.withdraw_table.findUniqueOrThrow({
      select: {
        options: true
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    })

    return process;
  }

  public async clearWallets(processId: string) {
    await this._prisma.withdraw_table.update({
      data: {
        problem_wallets: ''
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    })
  }

  public async deleteProcess(processId: string) {
    await this._prisma.withdraw_table.update({
      data: {
        is_delete: 1
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    })
  }

  public async addLogs(processId: string, logs: string) {
    await this._prisma.withdraw_table.update({
      data: {
        logs: logs
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    })
  }

  public async deleteClearLogs(processId: string) {
    await this._prisma.withdraw_table.update({
      data: {
        logs: '[]'
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    })

  }

  public async addBrokenLogs(processId: string, logs: string) {
    await this._prisma.withdraw_table.update({
      data: {
        broken_logs: logs
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    })
  }

  public async changeProblemWalletCount(processId: string, problemWalletCount: number) {
    await this._prisma.withdraw_table.update({
      data: {
        problem_wallet_count: problemWalletCount
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    })
  }

  public async getLogs(processId: string) {
    const logs = (await this._prisma.withdraw_table.findUnique({
      select: {
        logs: true
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    }))?.logs;
    
    return logs;
  }

  public async getBrokenLogs(processId: string) {
    const logs = (await this._prisma.withdraw_table.findUnique({
      select: {
        broken_logs: true
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    }))?.broken_logs;
    
    return logs;
  }


  public async getUserProcesses(userId: number) {
    const ids = await this._prisma.withdraw_table.findMany({
      select: {
        id_process: true,
      },
      where: {
        id_user: userId,
        is_delete: 0,
        status: {
          in: ['enabled', 'pause'],
        }
      },
    })

    return ids;
  }

  public async getUserByProcessId(processId: string) {
    const userId = (await this._prisma.withdraw_table.findUnique({
      select: {
        id_user: true
      },
      where: {
        id_process: processId,
        is_delete: 0
      }
    }))?.id_user;

    return userId;
  }
}
