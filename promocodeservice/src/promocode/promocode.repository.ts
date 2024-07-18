import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreatePromocodeConfig, Promocode, PromocodeConfig } from "types/types";

@Injectable()
export class PromocodeRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async getPromocode(promocode: string): Promise<Promocode | null> {
    const result = await this._prisma.promocode_table.findFirst({
      select: {
        config: true,
        used_by: true
      },
      where: {
        promocode,
        is_delete: 0
      }
    });
    return result ? {
      promocode,
      usedBy: result.used_by,
      config: result.config as unknown as PromocodeConfig
    } : null;
  }

  async addUserToPromocode(promocode: string, userId: number, prevUsedBy: number[]) {
    await this._prisma.promocode_table.update({
      data: {
        used_by: prevUsedBy.concat(userId)
      },
      where: {
        promocode,
        is_delete: 0
      }
    })
  }

  async createPromocode(promocode: string, config: CreatePromocodeConfig) {
    return await this._prisma.promocode_table.create({
      data: {
        promocode,
        config: config
      }
    });
  }
}