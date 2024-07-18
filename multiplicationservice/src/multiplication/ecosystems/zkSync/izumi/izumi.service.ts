import { Wallet, Contract, BigNumber } from "ethers";
import { getJsonRpcProviderByNetworkName, getNetworkName, getTokenAddressByNetwork } from '../../../../multiplication/utils/utils-config';
import { UtilsIzumi } from "./utils/utils-izumi";
import { allowedTokens, getIzumiSwapAddressesByNetwork, izumiFinancePoolFeesToETH } from "./utils/config-izumi";
import { Interface, hexConcat, hexDataSlice, hexZeroPad, hexlify, parseEther, parseUnits } from "ethers/lib/utils";
import { UtilsContracts } from "multiplication/utils/utils-contracts";
import { erc20Abi } from "../syncswap/abi/erc20-abi";
import { izumiFinanceRouterAbi } from "./abi/izumiFinanceRouter-abi";


export class IzumiService {

    public static async izumiSwap(
        wallet: Wallet,
        tokenBuy: string,
        tokenSell: string,
        amountStr: string,
        courseEth: number,
        course: number,
        networkName?: string
    ): Promise<string> {
        if (tokenBuy.toUpperCase() === tokenSell.toUpperCase()) {
            throw new Error('Error with swapping tokens: cannot swap same tokens');
        }

        const useWethAsEth = true;

        this._connectWallet2ProviderIfNotConnected(wallet, UtilsIzumi.DefaultNetworkName);

        let chainId;
        try {
            chainId = (await wallet.provider.getNetwork()).chainId;
        } catch (e) {
            chainId = undefined;
        }

        // выбираем сеть из возможных
        // в случае, если ни одна из сетей не указана, то по умолчанию берётся zksync
        // TODO: нужно будет сделать выборку из сетей по умолчанию для определённых экосистем
        const networkId = getNetworkName(chainId ? chainId : networkName ?? UtilsIzumi.DefaultNetworkName);


        const tokenBuyAddress = getTokenAddressByNetwork(networkId, tokenBuy, useWethAsEth);
        const tokenSellAddress = getTokenAddressByNetwork(networkId, tokenSell, useWethAsEth);
        const ethTokenAddress = getTokenAddressByNetwork(networkId, 'ETH', useWethAsEth);

        if (!(allowedTokens.includes(tokenBuy) && allowedTokens.includes(tokenSell))) {
            throw new Error('Error by swapping tokens: tokens are not supported');
        }

        const IZUMI_ROUTER_ADDRESS = getIzumiSwapAddressesByNetwork(networkId, 'IzumiFinanceRouter');
        // const IZUMI_FACTORY_ADDRESS = getIzumiSwapAddressesByNetwork(networkId, 'IzumiFinancePoolFactory');

        // Ставим количество дробной части токена, в зависимости от его адреса
        let swapAmount;
        if (tokenSell === "ETH") {
            swapAmount = parseEther(amountStr);
            await UtilsContracts.checkBalance(wallet, tokenSell, amountStr, courseEth, undefined, useWethAsEth);
        } else {
            const tokenSellContract = new Contract(tokenSellAddress, erc20Abi, wallet);
            swapAmount = parseUnits(amountStr, await tokenSellContract.decimals());
            await UtilsContracts.checkBalance(wallet, tokenSell, amountStr, course, tokenSellContract, useWethAsEth);
            try {
                await UtilsContracts.approveInfIfLowerThanLimit(
                    tokenSellContract,
                    wallet,
                    IZUMI_ROUTER_ADDRESS,
                    swapAmount
                );
            } catch (error: unknown) {
                throw new Error(`Error by swapping tokens: Cannot approve tokens( ${error} )`);
            }
        }

        const isMulticall = this._isMulticall(tokenSell, tokenBuy);
        const router = new Contract(IZUMI_ROUTER_ADDRESS, izumiFinanceRouterAbi, wallet);

        // проверка на мультиколл или мультихоп
        if (isMulticall) {
            const poolFee = tokenSell === "ETH" ? izumiFinancePoolFeesToETH[tokenBuy] : izumiFinancePoolFeesToETH[tokenSell];

            const multicallData = this._createMulticallData(tokenSellAddress, tokenBuyAddress, swapAmount, tokenSell, wallet, poolFee);

            try {
                const res = await router.multicall(multicallData, { value: tokenSell === "ETH" ? swapAmount : 0 });
                const tx = await res.wait();
                return tx.transactionHash;
            } catch (error: unknown) {
                throw new Error(`Error by swapping tokens: Cannot swap tokens( ${error} )`);
            }
        } else {
            const poolFee = [izumiFinancePoolFeesToETH[tokenSell], izumiFinancePoolFeesToETH[tokenBuy]];
            const multihopData = this._createMultihopData(tokenSellAddress, tokenBuyAddress, swapAmount, wallet, poolFee, ethTokenAddress);
            try {
                const res = await router.swapAmount(multihopData);
                const tx = await res.wait();
                return tx.transactionHash;
            } catch (error: unknown) {
                throw new Error(`Error by swapping tokens: Cannot swap tokens( ${error} )`);
            }
        }
    }

    // создает данные для вызова метода multicall, в случае если ни один из токенов не является ETH, вызывается метод swapAmount
    // Multicall нужен для того чтобы в конце обмена вернуть оставшийся ETH или анврапнуть WETH
    private static _createMulticallData(tokenSellAddress: string, tokenBuyAddress: string, swapAmount: BigNumber, tokenSell: string, wallet: Wallet, poolFee: number): string[] {
        const path = this._createSwapPath(tokenSellAddress, tokenBuyAddress, poolFee);
        const deadline = BigNumber.from(Math.floor(Date.now() / 1000)).add(1800);

        const routerInterface = new Interface(izumiFinanceRouterAbi);

        const swapData = routerInterface.encodeFunctionData('swapAmount', [[path, wallet.address, swapAmount, 0, deadline]]);

        const unwrapWethData = routerInterface.encodeFunctionData('unwrapWETH9', [0, wallet.address]);
        const refundETHData = routerInterface.encodeFunctionData('refundETH');

        const multicallData = tokenSell === "ETH" ? [swapData, refundETHData] : [swapData, unwrapWethData];

        return multicallData;
    }

    // @param {number[]} poolFee - массив из 2-х чисел, где первое число - fee для токена, который продается, второе - для токена, который покупается
    private static _createMultihopData(tokenSellAddress: string, tokenBuyAddress: string, swapAmount: BigNumber, wallet: Wallet, poolFee: number[], ethTokenAddress: string): string[] {
        const firstPart = this._createSwapPath(tokenSellAddress, ethTokenAddress, poolFee[0]);
        const secondPart = this._createSwapPath(ethTokenAddress, tokenBuyAddress, poolFee[1]);
        const secondPartWithoutFirstToken = hexDataSlice(secondPart, 20);
        const path = hexConcat([firstPart, secondPartWithoutFirstToken]);

        const deadline = BigNumber.from(Math.floor(Date.now() / 1000)).add(1800);
        // const swapData = defaultAbiCoder.encode(
        //     ["tuple(bytes, address, uint128, uint256, uint256)"],
        //     [[path, wallet.address, swapAmount, 0, deadline]])
        // const swapData = routerInterface.encodeFunctionData('swapAmount', [[path, wallet.address, swapAmount, 0, deadline]]);

        return [path, wallet.address, swapAmount.toString(), "0", deadline.toString()];
    }

    // создает путь для обмена токенов
    private static _createSwapPath(tokenSellAddress: string, tokenBuyAddress: string, poolFee: number): string {
        // передаем только 3 байта, т.к принимается uint24
        const poolFeeHex = hexZeroPad(hexlify(poolFee), 3);
        // конкатенируем адреса токенов и baseFee
        const path = hexConcat([tokenSellAddress, poolFeeHex, tokenBuyAddress]);

        return path;
    }

    private static _connectWallet2ProviderIfNotConnected(account: Wallet, networkName?: string) {
        const networkNameToLower = networkName?.toLowerCase();

        try {
            account._checkProvider();
        } catch (e) {
            const jsonRpcProvider = getJsonRpcProviderByNetworkName(
                networkNameToLower ?
                    networkNameToLower :
                    UtilsIzumi.DefaultNetworkName
            );

            account.connect(jsonRpcProvider);
        }
    }

    // проверяет если токен продажи или покупки - ETH
    // на данный момент немного костыльно, но имея в виду что у нас только 3 токена, то такой вариант вполне себе рабочий
    private static _isMulticall(tokenSell: string, tokenBuy: string): boolean {
        return tokenSell === "ETH" || tokenBuy === "ETH";
    }
}