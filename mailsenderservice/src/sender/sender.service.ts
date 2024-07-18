import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { EMAIL_SENDER, HOST_SENDER, PASSWORD_SENDER, PORT_SENDER } from 'utils/env';
import { templateBrandingMail } from './utils/templates';
import { SendMessageParamsType } from 'types/types';
import { Options } from 'nodemailer/lib/smtp-transport';
import { ApiError } from 'error/api.error';

@Injectable()
export class SendService {
  private _transporter;
  constructor() {
    const options: Options = {
      host: HOST_SENDER,
      port: +PORT_SENDER,
      secure: true,
      auth: {
        user: EMAIL_SENDER,
        pass: PASSWORD_SENDER,
      },
    };
    this._transporter = nodemailer.createTransport<Options>(options);
  }

  async sendMailToClient({ email, subject, text, typeMessage }: SendMessageParamsType): Promise<void> {
    this._transporter.sendMail(
      {
        from: `Retro-support <${EMAIL_SENDER}>`,
        messageId: `Retro-message-${this._generateOrderId()}`,
        sender: `Retro-support`,
        date: new Date(),
        to: email,
        subject: subject,
        text: text, // plain text body
        html: templateBrandingMail(text), // html body
        // amp: templateBrandingMail(text, typeMessage), // html body
      },
      (error) => {
        throw ApiError.Server(error?.message ?? 'Internal server error by sending email');
      },
    );
  }

  private _generateOrderId(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
