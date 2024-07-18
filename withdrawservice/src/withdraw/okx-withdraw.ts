import { Injectable } from '@nestjs/common';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { ApiError } from 'error/api.error';
import { IExchanger, OkxTokenType, WithdrawConfigType } from 'types/types';
import { COIN_SYMBOLS } from '../utils/config';
import {
  OKX_API_KEY,
  OKX_API_URL_CURRENCIES,
  OKX_API_URL_WITHDRAW,
  OKX_PASSPHRASE,
  OKX_SECRET_KEY,
  OKX_TIMEOUT,
  OKX_URL,
} from '../utils/env';

@Injectable()
export class OkxService implements IExchanger {
  public async checkApi(passphrase: string, apiKey: string, secretKey: string) {
    const timestamp = new Date().toISOString().split('.')[0] + 'Z';
    const response = await axios.get(OKX_URL + OKX_API_URL_CURRENCIES, {
      params: {
        ccy: 'ETH',
      },
      headers: {
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-SIGN': this.generateSign(
          OKX_API_URL_CURRENCIES,
          timestamp,
          'GET',
          '?ccy=ETH',
          secretKey,
        ),
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': apiKey,
        'OK-ACCESS-PASSPHRASE': passphrase,
      },
    });
    const parsedResponse = response.data;
    const responseError = parsedResponse.msg;

    if (responseError && responseError.length > 0) {
      throw ApiError.Unauthorized("Incorrect api");
    }
  }

  public async getCurrencies(): Promise<OkxTokenType[]> {
    const timestamp = new Date().toISOString().split('.')[0] + 'Z';
    const response = await axios.get(OKX_URL + OKX_API_URL_CURRENCIES, {
      params: {
        ccy: COIN_SYMBOLS,
      },
      headers: {
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-SIGN': this.generateSign(
          OKX_API_URL_CURRENCIES,
          timestamp,
          'GET',
          '?ccy=' + COIN_SYMBOLS,
          OKX_SECRET_KEY,
        ),
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': OKX_API_KEY,
        'OK-ACCESS-PASSPHRASE': OKX_PASSPHRASE,
      },
    });

    const parsedResponse = response.data;
    const responseError = parsedResponse.msg;

    if (responseError && responseError.length > 0) {
      throw ApiError.Server(responseError);
    }

    const tokenList: OkxTokenType[] = [];

    for (const token of parsedResponse.data) {
      const existToken = tokenList.find((t) => t.ccy === token.ccy);
      if (!existToken) {
        tokenList.push({ ccy: token.ccy, logo: token.logoLink, networks: [] });
      }
      tokenList.at(-1)!.networks.push({
        name: token.chain,
        minFee: token.minFee,
        maxFee: token.maxFee,
      });
    }

    return tokenList;
  }
  
  public async withdraw(destinationWallet: string, okxConfig: WithdrawConfigType, amt: string) {
    if (!okxConfig) {
      throw ApiError.BadRequest('Incorrect type of config');
    }
    const withdrawalParams = {
      amt,
      fee: okxConfig.fee,
      dest: 4, // ON-CHAIN withdrawal. 3 for internal
      ccy: okxConfig.ccy,
      chain: okxConfig.chain,
      toAddr: destinationWallet,
    };

    const timestamp = new Date().toISOString().split('.')[0] + 'Z';
    const body = JSON.stringify(withdrawalParams);

    const response = await axios.post(OKX_URL + OKX_API_URL_WITHDRAW, body, {
      headers: {
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-SIGN': this.generateSign(OKX_API_URL_WITHDRAW, timestamp, 'POST', body, okxConfig.secretKey),
        'Content-Type': 'application/json',
        'OK-ACCESS-KEY': okxConfig.apiKey,
        'OK-ACCESS-PASSPHRASE': okxConfig.passphrase,
      },
      timeout: +OKX_TIMEOUT
    });

    const parsedResponse = response.data;
    const responseError = parsedResponse.msg;

    if (responseError && responseError.length > 0) {
      throw ApiError.BadRequest(responseError);
    }
  }

  private generateSign(api: string, timestamp: string, method: string, body: string, secret: string) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp + method + api + body, secret));
  }
}
