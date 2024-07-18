import { Wallet } from 'ethers';
import { NetworkPathes } from 'types/operations.types';

/**
 * Utility class for ecosystem related functions.
 */
export class UtilsEcosystem {
  /**
   * @description This method makes a delay of a random value from the range
   * @param min delay time example 1 second
   * @param max delay time example 7 second
   * @returns {Promise<void>}
   */
  public static async delay(min: number, max: number): Promise<void> {
    if (min > max) {
      throw new Error('The minimum value must be less than the maximum value');
    }

    const milliseconds = UtilsEcosystem._getRandomNumber(min, max) * 1000;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, milliseconds);
    });
  }

  /**
   * @description Randomizes the price and decimal places based on the given minimum and maximum values.
   * @param {number} min - The minimum value for the price.
   * @param {number} max - The maximum value for the price.
   * @param {number} minDecimalPlaces - The minimum number of decimal places.
   * @param {number} maxDecimalPlaces - The maximum number of decimal places.
   * @returns {number} - The randomized price with the specified number of decimal places.
   */
  public static randomizePriceAndDecimalPlaces(
    min: number,
    max: number,
    minDecimalPlaces: number,
    maxDecimalPlaces: number,
  ): string {
    if (min > max || minDecimalPlaces > maxDecimalPlaces || (min > max && minDecimalPlaces > maxDecimalPlaces)) {
      throw new Error('The minimum value must be less than the maximum value');
    }
    const randomPrice = this._getRandomNumber(min, max);
    const randomDecimalPlaces = Math.floor(
      minDecimalPlaces + Math.random() * (maxDecimalPlaces + 1 - minDecimalPlaces),
    );
    const roundedPrice = randomPrice.toFixed(randomDecimalPlaces);

    return roundedPrice;
  }

  public static getRandomItemFromArray<T>(array: T[]): T {
    const id = Math.floor(Math.random() * (array.length));
    return array[id];
  }

  private static _shuffleArray<T>(array: T[]): T[] {
    const copyWallets = [...array];

    for (let i = copyWallets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copyWallets[i], copyWallets[j]] = [copyWallets[j], copyWallets[i]];
    }
    return copyWallets;
  }

  /**
   * Generates a random token or selects a network from a list of tokens or networks.
   * @param {string | string[]} symbolsOrNetworks - A string or an array of strings representing tokens or networks.
   * @returns {string} - A randomly selected token or network.
   */
  public static randomTokenOrNetworkFromListTokensOrNetwork = (symbolsOrNetworks: string | string[]): string => {
    return Array.isArray(symbolsOrNetworks)
      ? this.getRandomItemFromArray(symbolsOrNetworks)
      : symbolsOrNetworks;
  };

  /**
   * Generates a random network from a given list of networks.
   * @param network - The list of networks to choose from.
   * @returns The randomly selected network.
   */
  public static randomNetworkFromListNetwork = (network: string[]): string => {
    return this.randomTokenOrNetworkFromListTokensOrNetwork(network);
  };

  /**
   * @description Shuffles an array of private keys as strings using the Fisher-Yates algorithm.
   * @param {Wallet[]} wallets - The array of wallets to be shuffled.
   * @returns {Wallet[]} - The shuffled array of wallets.
   */
  public static shufflePrivateKeys(wallets: Wallet[]) {
    const copyWallets: Wallet[] = [...wallets];

    for (let i = copyWallets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copyWallets[i], copyWallets[j]] = [copyWallets[j], copyWallets[i]];
    }
    return copyWallets;
  }

  /**
   * @description Shuffles an array of wallets using the Fisher-Yates algorithm.
   * @param {Wallet[]} wallets - The array of wallets to be shuffled.
   * @returns {Wallet[]} - The shuffled array of wallets.
   */
  public static shuffleWallets(wallets: Wallet[]) {
    const copyWallets: Wallet[] = [...wallets];

    for (let i = copyWallets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copyWallets[i], copyWallets[j]] = [copyWallets[j], copyWallets[i]];
    }
    return copyWallets;
  }

  /**
   * Generates network paths for operations.
   * @param _fromNetwork - The input networks.
   * @param _toNetwork - The output networks.
   * @returns An array of network path combinations.
   */
  public static generateNetworkPathsForOperations(
    _fromNetwork: string | string[],
    _toNetwork: string | string[],
  ): NetworkPathes[] {
    const combinations: NetworkPathes[] = [];

    if (Array.isArray(_fromNetwork) && Array.isArray(_toNetwork)) {
      for (const from of _fromNetwork) {
        for (const to of _toNetwork) {
          combinations.push({
            fromNetwork: from,
            toNetwork: to,
          });
        }
      }
    } else if (Array.isArray(_fromNetwork) && !Array.isArray(_toNetwork)) {
      for (const from of _fromNetwork) {
        combinations.push({
          fromNetwork: from,
          toNetwork: _toNetwork,
        });
      }
    } else if (Array.isArray(_toNetwork) && !Array.isArray(_fromNetwork)) {
      for (const to of _toNetwork) {
        combinations.push({
          fromNetwork: _fromNetwork,
          toNetwork: to,
        });
      }
    } else {
      combinations.push({
        fromNetwork: _fromNetwork as string,
        toNetwork: _toNetwork as string,
      });
    }
    return this._shuffleArray(combinations);
  }

  /**
   * @description Returns a random delay between the specified minimum and maximum values.
   * @param min - The minimum value.
   * @param max - The maximum value.
   * @returns The random delay.
   */
  private static _getRandomNumber(min: number, max: number): number {
    if (min > max) {
      throw new Error('The minimum value must be less than the maximum value');
    }
    const random = min + Math.random() * (max - min);
    return random;
  }
}
