import { Injectable } from '@nestjs/common';
import { VerificationRepository } from './verification.repository';
import { generateRandomString } from 'utils/helpers';
import { ApiError } from 'error/api.error';
import { CODE_EXPIRATION_TIME } from 'utils/env';
import { RegistrationService } from 'register/register.service';
import { verificationEmailTemplate } from 'mail-templates/mail-templates';


@Injectable()
export class VerificationService {
    constructor(
        private readonly _verificationRepository: VerificationRepository,
        private _regService: RegistrationService,
    ) { }

    public async sendVerificationEmail(userId: number) {
        const { expireConfirmCode, isConfirmed } = await this._verificationRepository.getVerificationData(userId);

        if (isConfirmed) {
            throw ApiError.BadRequest('Email already confirmed');
        }

        if (expireConfirmCode) {
            const isTimePassed = await this._verifyTimePassed(expireConfirmCode);
            if (!isTimePassed) {
                throw ApiError.BadRequest('Too many requests');
            }
        }

        const code = generateRandomString(6);
        await this._verificationRepository.setVerificationCode(userId, code);
        const email = await this._verificationRepository.getUserEmail(userId);

        // send email message to user
        await this._regService.verifyUser({
            email: [email],
            subject: 'Верификация аккаунта Retro',
            text: verificationEmailTemplate(code),
            typeMessage: 'user-verification',
        });
    }

    public async verifyEmail(userId: number, code: string) {
        const verificationData = await this._verificationRepository.getVerificationData(userId);
        if (!verificationData.confirmCode && !verificationData.expireConfirmCode) {
            throw ApiError.NotFound('Code not found');
        }

        if (verificationData.expireConfirmCode! < new Date()) {
            throw ApiError.BadRequest('Code expired');
        }

        if (verificationData.isConfirmed) {
            throw ApiError.BadRequest('Email already confirmed');
        }

        if (verificationData.confirmCode !== code) {
            throw ApiError.BadRequest('Invalid code');
        }


        await this._verificationRepository.verifyUser(userId);
    }

    public async isUserVerified(userId: number): Promise<boolean> {
        const verificationData = await this._verificationRepository.getVerificationData(userId);
        return verificationData.isConfirmed!;
    }

    private async _verifyTimePassed(expireConfirmCode: Date): Promise<boolean> {
        return Date.now() >= (Number(expireConfirmCode) - 1000 * 60 * (CODE_EXPIRATION_TIME - 1));
    }

}
