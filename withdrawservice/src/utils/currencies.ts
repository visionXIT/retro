import axios from "axios";
import { ApiError } from "error/api.error";

export const getCourse = async (ccy: string) => {
  if (ccy == 'DAI' || ccy == 'USDC' || ccy == 'USDT') {
    return 1;
  }
  return 1 / await queryCurrency(ccy);
}

export const queryCurrency = async (ccy: string) => {
  let cc;
  if (ccy === 'ETH') {
    cc = 80;
  } else if (ccy === 'WBTC') {
    cc = 90;
  } 
  const url = `https://api.coinlore.net/api/ticker/?id=${cc}`;
  const res = await axios.get(url);
  if (!res?.data[0]?.price_usd) {
    throw ApiError.BadRequest("Cannot fetch info about cuurency price");
  }
  return +res.data[0].price_usd;
}

export const numDecimals = new Map<string, {min: number, max: number}>(
  [
    ['ETH', {min: 5, max: 8}], ['WETH', {min: 5, max: 8}], ['WBTC', {min: 6, max: 8}], 
    ['USDC', {min: 1, max: 5}],  ['USDT', {min: 1, max: 5}],  ['DAI', {min: 1, max: 5}],
  ]
)