import { Injectable } from '@nestjs/common';
import { JsonObject } from '@prisma/client/runtime/library';
import { ApiError } from 'error/api.error';
import { PrismaService } from 'prisma/prisma.service';
import { getMultiplicationEcosytemDataByNetworkName, toEcosystemId } from 'types/getMultiplicationEcosytemData';
import { OptionType, ProcessStatus } from 'types/multiplication.types';
import { LoggerType } from 'types/services.types';

@Injectable()
export class MultiplicationRepository {
  constructor(private readonly _prisma: PrismaService) {}

  public async createProcess({
    idProcess,
    userId,
    status,
    option,
    ecosystem,
    walletCount,
  }: {
    idProcess: string;
    userId: number;
    status: string;
    option: OptionType;
    ecosystem: string;
    walletCount: number;
  }) {
    await this._prisma.multiplicator_table.create({
      data: {
        id_process: idProcess,
        id_user: userId,
        status_process: status,
        options: option,
        ecosystem: ecosystem,
        wallet_count: walletCount,
        problem_wallet_count: 0,
      }
    })
  }

  public async updateStatusProcess(idProcess: string, status: string) {
    await this._prisma.multiplicator_table.update({
      data: {
        status_process: status,
      },
      where: {
        id_process: idProcess,
      }
    })
  }

  public async updateWalletCounts(idProcess: string, problemWalletCount: number) {
    await this._prisma.multiplicator_table.update({
      data: {
        problem_wallet_count: problemWalletCount
      },
      where: {
        id_process: idProcess
      }
    })
  }

  public async getAllProcessInfo(userId: number) {
    const dataTable = await this._prisma.multiplicator_table.findMany({
      select: {
        id_process: true,
        id_user: true,
        status_process: true,
        options: true,
        ecosystem: true,
        logs: true,
        wallet_count: true,
        problem_wallet_count: true,
        create_at: true,
      },
      where: {
        id_user: userId,
        status_process: {
          in: ['enabled', 'pause'],
        },
      },
      orderBy: {
        id: 'asc',
      }
    })


    const data = dataTable.map((item) => {
      return {
        idProcess: item.id_process,
        idUser: item.id_user,
        statusProcess: item.status_process,
        options: item.options,
        ecosystem: item.ecosystem,
        logs: item.logs,
        walletCount: item.wallet_count,
        problemWalletCount: item.problem_wallet_count,
        createAt: item.create_at,
      }
    })

    return data;
  }


  
  public async getEcosystemDataByUserId(userId: number) {
    let constructedData = {}; 
    try {
      const ecosystemData = await this._prisma.user_subscribe_table.findMany({
        select: {
          actions_used: true,
          actions_limit: true,
          id_subscribe: true,
        },
        where: {
          id_user: userId,
        },
        orderBy: {
          id: 'asc',
        }
      });


      const ecosystemConstructData = [];
      if(ecosystemData.length !== 0) {
        for (const ecosystemElement of ecosystemData) {
          const {actions_limit, actions_used, id_subscribe} = ecosystemElement;
          const actionsRemained = actions_limit !== null && actions_used !== null ? actions_limit - actions_used: undefined;
          ecosystemConstructData.push({
            subscribeId: id_subscribe,
            actionsTotal: actions_limit,
            actionsRemained: actionsRemained,
          });
        }
      }
      

      
      const subscribeData = await this._prisma.subscribe_table.findMany({
          select: {
            id: true,
            is_enabled: true,
            name: true,
          },
          where: {
            is_delete: 0
          }
      });
      


      const constructedEcosystemData = [];
      for (let i = 0; i < subscribeData.length; i++) {
        const subscribeJsonElement = subscribeData[i];
        const ecosystemJsonElement = ecosystemConstructData.filter(item => item.subscribeId === subscribeJsonElement.id)[0];
        let _actionsTotal, _actionsRemained;

        if(ecosystemJsonElement !== undefined) {
          const {actionsTotal, actionsRemained} = ecosystemJsonElement;
          _actionsTotal = actionsTotal
          _actionsRemained = actionsRemained;
        }

        const networkName = subscribeJsonElement.name as string;
        const ecosystemProjectsByNetworkName = getMultiplicationEcosytemDataByNetworkName(networkName);

        constructedEcosystemData.push({
          ecosystemName: toEcosystemId(networkName),
          networkName: networkName,
          isEnabled: subscribeJsonElement.is_enabled,
          actionsTotal: _actionsTotal,
          actionsRemained: _actionsRemained,
          projects: ecosystemProjectsByNetworkName,
        });
      }

      constructedData = constructedEcosystemData;

    } catch (e) {
      constructedData = {
        error: 'Bad Request',
      }
    } finally {
      return constructedData;
    }

  }

  public async setArtifactProcess(idProcess: string, artifact: string[]) {
    await this._prisma.multiplicator_table.update({
      data: {
        artifact: artifact
      },
      where: {
        id_process: idProcess,
      }
    })
  }

  public async getProcessPauseById(idProcess: string) {
    const result = await this._prisma.multiplicator_table.findFirst({
      select: {
        id_process: true,
        artifact: true,
        options: true,
      },
      where: {
        id_process: idProcess,
        status_process: 'pause',
      }
    })

    const process: {
      idProcess: string;
      artifact: string[];
      oldOptions: OptionType;
    } = {
      idProcess: result?.id_process!,
      artifact: result?.artifact!,
      oldOptions: result?.options! as OptionType,
    }

    return process;
  }

  public async getProcessById(idProcess: string) {
    const result = await this._prisma.multiplicator_table.findFirst({
      select: {
        id_process: true,
        artifact: true,
        options: true,
      },
      where: {
        id_process: idProcess
      }
    })

    const process: {
      idProcess: string;
      artifact: string[];
      options: OptionType;
    } = {
      idProcess: result?.id_process!,
      artifact: result?.artifact!,
      options: result?.options! as OptionType,
    }

    return process;
  }

  public async enabledEmergencyStopProcess(idProcess: string) {
    await this._prisma.multiplicator_table.update({
      data: {
        status_process: 'disabled',
        is_emergency_stop: 1,
      },
      where: {
        id_process: idProcess
      }
    })
  }

  public async getEmergencyStopProcess(idProcess: string) {
    const result = await this._prisma.multiplicator_table.findFirst({
      select: {
        is_emergency_stop: true,
      },
      where: {
        id_process: idProcess,
      }
    })

    return { isEmergencyStop: result?.is_emergency_stop };
  }

  public async getLogsByIdProcess(idProcess: string) {
    const result = await this._prisma.multiplicator_table.findUnique({
      select: {
        logs: true,
        wallet_count: true,
        problem_wallet_count: true,
        options: true,
      },
      where: {
        id_process: idProcess,
      }
    })

    const logs: {
      walletCount: number;
      problemWalletCount: number;
      logs: LoggerType[];
      options: OptionType;
    } = {
      walletCount: result?.wallet_count!,
      problemWalletCount: result?.problem_wallet_count!,
      logs: result?.logs! as LoggerType[],
      options: result?.options! as OptionType,
    }

    return logs;
  }

  public async setLogsByIdProcess(idProcess: string, logs: LoggerType[]) {
    await this._prisma.multiplicator_table.update({
      data: {
        logs: logs as JsonObject[],
      },
      where: {
        id_process: idProcess,
      }
    })
  }

  public async checkingStatusProcess(idProcess: string, userId: number): Promise<ProcessStatus> {
    const result = await this._prisma.multiplicator_table.findFirst({
      select: {
        status_process: true
      },
      where: {
        id_user: userId,
        id_process: idProcess,
      }
    })

    return result?.status_process as ProcessStatus;
  }

  public async getUserByProcessId(processId: string) {
    const result = await this._prisma.multiplicator_table.findFirst({
      select: {
        id_user: true
      },
      where: {
        id_process: processId,
        is_delete: 0,
      }
    })

    return result?.id_user;
  }

  public async checkProcessId(idProcess: string) {
    const result = await this._prisma.multiplicator_table.findFirst({
      select: {
        id: true,
      },
      where: {
        id_process: idProcess,
      }
    })

    return result?.id ? true : false;
  }

  public async checkUserId(userId: number) {
    const result = await this._prisma.user_table.findFirst({
      select: {
        id: true,
      },
      where: {
        id: userId,
      }
    })

    return result?.id ? true : false;
  }
}
