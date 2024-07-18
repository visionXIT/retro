import axios from "axios";
import { ApiError } from "error/api.error";
import tokensInfoJson from "./tokens.info.json";

export const getCourse = async (ccy: string) => {
  if (ccy == 'DAI' || ccy == 'USDC' || ccy == 'USDT') {
    return 1;
  }
  return 1 / await queryCurrency(ccy);
}

export const queryCurrency = async (ccy: string) => {
  let cc;
  if (ccy === 'ETH' || ccy === 'WETH') {
    cc = 80;
  } else if (ccy === 'WBTC') {
    cc = 90;
  } 
  const url = `https://api.coinlore.net/api/ticker/?id=${cc}`;
  let res;

  try {
     res = await axios.get(url);
  } catch (e: any) {
    // TODO: нужно исправить данное костыльное решение либо через Coinbase
    // либо хранить данные у себя по цене токена
    res = tokensInfoJson;
  }
  
  if (!res?.data[0]?.price_usd) {
    throw ApiError.BadRequest("Cannot fetch info about curency price");
  }
  return +res.data[0].price_usd;
}