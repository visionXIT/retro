import { Body, Controller, Get, Post, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { ErrorFilter } from 'error/api-error-http.filter';
import { AuthUser } from 'guards/auth.decorator';

@UseFilters(ErrorFilter)
@Controller('auth/verification')
export class VerificationController {
    constructor(private readonly _verificationService: VerificationService) {}

    @Post('sendVerificationEmail')
    async sendVerificationEmail(@AuthUser('userId') userId: number) {
        await this._verificationService.sendVerificationEmail(userId);

        return { message: 'Verification email sent' };
    }

    @Post('verifyEmail')
    async verifyEmail(@Body('code') code: string, @AuthUser('userId') userId: number) {
        await this._verificationService.verifyEmail(userId, code);
        return { message: 'Email verified' };
    }

    @Get('isUserVerified')
    async isUserVerified(@AuthUser('userId') userId: number) {
        const isVerified = await this._verificationService.isUserVerified(userId);
        return { isVerified };
    }
}
