import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { VerificationDataType } from "types/types";
import { CODE_EXPIRATION_TIME } from "utils/env";


@Injectable()
export class VerificationRepository {
    constructor(private readonly _prismaService: PrismaService) {}

    public async setVerificationCode(userId: number, code: string) {
        const idAuth = await this._getAuthId(userId);
        
        await this._prismaService.auth_table.update({
            data: {
                confirmCode: code,
                expireConfirmCode: new Date(Date.now() + 1000 * 60 * CODE_EXPIRATION_TIME)
            },
            where: {
                id: idAuth
            }
        })
    }

    public async getUserEmail(userId: number): Promise<string> {
        const idAuth = await this._getAuthId(userId);
        const result = await this._prismaService.auth_table.findUniqueOrThrow({
            select: {
                email: true
            },
            where: {
                id: idAuth
            }
        })

        return result.email!;
    }

    public async getVerificationData(userId: number): Promise<VerificationDataType> {
        const idAuth = await this._getAuthId(userId);
        const result = await this._prismaService.auth_table.findUnique({
            select: {
                confirmCode: true,
                expireConfirmCode: true,
                isConfirmed: true
            },
            where: {
                id: idAuth
            }
        })

        return {
            confirmCode: result?.confirmCode,
            expireConfirmCode: result?.expireConfirmCode,
            isConfirmed: result?.isConfirmed
        };
    }

    public async verifyUser(userId: number) {
        await this._prismaService.auth_table.update({
            data: {
                isConfirmed: true,
                confirmCode: null,
                expireConfirmCode: null
            },
            where: {
                id: await this._getAuthId(userId)
            }
        })
    }


    private async _getAuthId(userId: number): Promise<number> {
        const result = await this._prismaService.user_table.findUniqueOrThrow({
            select: {
                id_auth: true
            },
            where: {
                id: userId
            }
        })

        return result.id_auth!;
    }

}