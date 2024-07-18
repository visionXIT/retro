import { LoggerType } from 'types/services.types';

export const changeLog = (log: LoggerType) => {
  return {
    ...log,
    addressWallet: changeAddress(log.addressWallet),
    messageLog: clearLogFromAddresses(log.messageLog),
  };
};

export const changeAddress = (address: string | string[] | undefined) => {
  if (Array.isArray(address)) {
    const addresses: string[] = [];
    for (const s of address) {
      addresses.push(_changeAddress(s));
    }
    return addresses;
  }
  return address ? _changeAddress(address) : undefined;
};

export const _changeAddress = (address: string) => {
  let newAddress = address.slice(0, 6);
  newAddress += '*********************';
  newAddress += address.slice(address.length - 4, address.length);
  return newAddress;
};

export const clearLogFromAddresses = (log: string | string[]) => {
  if (Array.isArray(log)) {
    const logs: string[] = [];
    for (const s of logs) {
      logs.push(_clearLogFromAddresses(s));
    }
    return logs;
  }
  return _clearLogFromAddresses(log);
};

export const _clearLogFromAddresses = (log: string) => {
  let found = false;
  let res = '',
    forChange = '';
  const splitters = ['.', ',', ' ', '!', ':'];
  for (let i = 0; i < log.length; i++) {
    if (found && splitters.includes(log[i])) {
      found = false;
      res += changeAddress(forChange) + ' ';
      forChange = '';
    } else if (found) {
      forChange += log[i];
    } else if (!found && log[i] == '0' && log[i + 1] == 'x') {
      found = true;
      forChange += '0x';
      i += 1;
    } else {
      res += log[i];
    }
  }
  if (forChange.length)
    res += _changeAddress(forChange);
  return res;
};
