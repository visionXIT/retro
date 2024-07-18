import { BigNumber, Contract, Wallet, constants, providers } from "ethers";
import { formatEther, formatUnits, parseEther } from "ethers/lib/utils";
import { erc20Abi } from "multiplication/ecosystems/zkSync/syncswap/abi/erc20-abi";
import { getJsonRpcProviderByNetworkName, nativeCurrencyByChainId, nativeCurrencyWraperByChainId } from "./utils-config";

export class UtilsContracts {
  private static readonly _MINIMAL_REQUIRED_BALANCE = BigInt(parseEther('0.0006').toString());
  private static readonly _NATIVE_CURRENCY_DECIMALS = BigInt(parseEther('1').toString());

  public static async checkBalance(wallet: Wallet, token: string, amount: string, course?: number, tokenContract?: Contract, useWethAsEth_?: boolean) {
    const walletBalanceEth = await wallet.getBalance();

    const useWethAsEth = useWethAsEth_ ?? false;
    const tokenToSwap = useWethAsEth && token === 'WETH' ? 'ETH' : token; 

    if(walletBalanceEth.isZero()) {
      throw new Error(`Error by swapping tokens: wallet balance is 0$ ETH`);
    }


    if (tokenToSwap === 'ETH') {
      const balance = +formatEther(walletBalanceEth);

      if (balance < +amount) {
        if (course) {
          throw new Error(`Error by swapping tokens: Insufficient balance( balance(${(balance / course).toFixed(2)}$ ETH) is lower than wanted amount(${(+amount / course).toFixed(2)}$ ETH) )`);
        }
        throw new Error(`Error by swapping tokens: Insufficient balance( balance of ETH is lower than wanted amount )`)
      }
      return;
    }
    if (!tokenContract) {
      throw new Error(`Error by swapping tokens: cannot recognize token contract`);
    }

    const tokenBalance = tokenContract.balanceOf(wallet.address);
    const tokenDecimals = tokenContract.decimals();

    const tokenData = await Promise.all([tokenBalance, tokenDecimals]);
    const balance = +formatUnits(tokenData[0], tokenData[1]);

    if (balance < +amount) {
      if (course) {
        throw new Error(`Error by swapping tokens: Insufficient balance( balance(${(balance / course).toFixed(2)}$ ${token.toUpperCase()}) is lower than wanted amount(${(+amount / course).toFixed(2)}$ ${token.toUpperCase()}))`);
      }
      throw new Error(`Error by swapping tokens: Insufficient balance( balance of ${token.toUpperCase()} is lower than wanted amount )`)
    }
  }


  public static async approveInfIfLowerThanLimit(
    tokenContract: Contract, 
    wallet: Wallet,
    addressToApprove: string, 
    limit: BigNumber
  ) {
    const existApprove: BigNumber = await tokenContract.allowance(wallet.address, addressToApprove);

    if (existApprove.lt(limit)) {
      const approveTx = await tokenContract.approve(addressToApprove, constants.MaxUint256);
      await approveTx.wait();
    }
  }

  public static processErrorInsufficientFunds(error: unknown, amountEth: number, errorText: string, courseEth?: number) {
    const e = error as {error: {body: string}};
    const errorBodyString = e?.error?.body;
    const errorBody: {error: {code: number, message: string}} = errorBodyString ? JSON.parse(errorBodyString) : null;
    const body = errorBody?.error?.message, code = errorBody?.error?.code;
    if (code === 3) {
      let fee, balance, value;
      try {
        const {feen, balancen, valuen} = UtilsContracts.extractBalancesFromErrorInsufficientFunds(body);
        fee = feen, balance = balancen, value = valuen;
        if (!courseEth) {
          courseEth = 1;
        }
        fee /= courseEth;
        balance /= courseEth;
        value /= courseEth;
      } catch (error: unknown) {
        throw new Error(`${errorText}: Insufficient balance`);
      }
      throw new Error(`${errorText}: Insufficient balance( balance: ${balance.toFixed(2)}$ ETH, ${value !== 0 ? `need: ${amountEth.toFixed(2)}$ ETH for exchange, ` : ''}fee: ${value !== 0 ? (fee + value - amountEth).toFixed(2) : fee.toFixed(2)}$ ETH`);
      
    }
    throw new Error(errorText + ": " + error);
  }

  public static extractBalancesFromErrorInsufficientFunds(error: string) {
    const balanceIndex = error.indexOf('balance: ') + 9;
    const balanceNum = error.slice(balanceIndex, error.indexOf(',', balanceIndex));
    const feeIndex = error.indexOf('fee: ') + 5;
    const feeNum = error.slice(feeIndex, error.indexOf(',', feeIndex));
    const valueIndex = error.indexOf('value: ') + 7;
    const valueNum = error.slice(valueIndex, error.indexOf(',', valueIndex) === -1 ? undefined : error.indexOf(',', valueIndex));
    return { 
      balancen: +formatEther(BigNumber.from(balanceNum.length ? balanceNum : 0)), 
      feen: +formatEther(BigNumber.from(feeNum.length ? feeNum : 0)), 
      valuen: +formatEther(BigNumber.from(valueNum.length ? valueNum : 0))
    };
  }
  public static async checkBalances(
      accountOrProvider: Wallet | providers.JsonRpcProvider,
      accountBalance: bigint,
      tokenToSwapSymbol: string,
      tokenToSwapAddress: string,
      swapAmount: bigint,
      useWethAsEth?: boolean,
      accountAddress?: string
    ) {
    if(accountBalance === 0n) {
      throw new Error(`Sorry, but your account balance in ETH is zero. Expected at least ${this._MINIMAL_REQUIRED_BALANCE / 10n**18n}`);
    }

    const useWethAsEth_: boolean = useWethAsEth ?? false;
    let provider, accountAddress_;


    // Проверяем если как параметр нам передаётся именно объект кошелька
    if(accountOrProvider instanceof Wallet) {
      accountAddress_ = accountOrProvider.address;
      provider = accountOrProvider.provider;
    } else if (accountOrProvider instanceof providers.JsonRpcProvider) {
      if(!accountAddress) {
        throw new Error('Account address is required');
      }

      accountAddress_ = accountAddress;
      provider = accountOrProvider;
    } else {
      throw new Error("Provider not defined!");
    }


    let nativeCurrency: string;
    try {
      const chainId = (await provider.getNetwork()).chainId;
      nativeCurrency = nativeCurrencyByChainId.get(chainId) as string;

      if(useWethAsEth_ === true && nativeCurrencyWraperByChainId.get(chainId) === tokenToSwapSymbol) {
        tokenToSwapSymbol = nativeCurrency;
      }
    } catch (error: any) {
      throw new Error(error);
    }

    if(tokenToSwapSymbol === nativeCurrency && accountBalance < swapAmount) {
      throw new EvalError(`Account native balance is less than swapAmount balance. Current: ${accountBalance}, Expected: ${swapAmount}`);
    } else if(tokenToSwapSymbol !== nativeCurrency) {
      const account = accountOrProvider as Wallet;
      
      const tokenContract = new Contract(tokenToSwapAddress, erc20Abi, account);
      const tokenBalance = tokenContract.balanceOf(accountAddress_);
      const tokenDecimals = tokenContract.decimals();

      const tokenData = await Promise.all([
        tokenBalance,
        tokenDecimals,
      ]);


      if(BigInt(tokenData[0].toString()) < swapAmount) {
        throw new EvalError(`Account balance of token ${tokenToSwapAddress} is less than swapAmount balance. Current: ${BigInt(tokenData[0].toString())}, Expected: ${swapAmount}`);
      }
    }
  }

  public static async wrapNativeCurrency(
    account: Wallet,
    wrapAddress: string,
    wrapAmount: bigint,
  ) {
    // const wrapContract = new Contract(wrapAddress, wethabi, account);

    try {
      const transferTx = await account.sendTransaction({
        to: wrapAddress,
        value: wrapAmount,
      });

      await transferTx.wait();
      console.log(transferTx);

      return transferTx;
    } catch (error) {
      console.log(error);
      throw new Error(`Transfer was not success! ${error}`);
    }
  }

  public static async connectWalletToProvider(wallet: Wallet, provider: string) {
    const networkProvider = getJsonRpcProviderByNetworkName(provider.toLowerCase());
    wallet.connect(networkProvider);
    
    try {
      wallet._checkProvider();
    } catch (error: unknown) {
      throw new Error("Error by bridging tokens: cannot connect to network provider");
    }
  }

  public static async transferEthToAddress(wallet: Wallet, percent: number, address: string) {
    const balance = await wallet.getBalance();
    const amount = balance.div(100).mul(percent);
    if (balance.isZero()) {
      throw new Error("Error by transfering eth: wallet balance is 0 ETH");
    }
    try {
      const tx = await wallet.sendTransaction({
        to: address,
        value: amount
      });
      return tx.hash;
    } catch (error: unknown) {
      this.processErrorInsufficientFunds(error, +formatEther(amount), 'Error by transfering eth');
      console.log(error);
      throw new Error("Error by transfering eth " + error);
    }
  }
}