export const getRandomNumber = (min: number, max: number) => {
  const rand = Math.random() * (max - min) + min;
  return rand;
};

export const getFixedNum = (x: string) => {
  return x.includes('.') ? (x.split('.').pop() as string).length : 0;
};

export const getRandomFixedNumber = (
  min: string,
  max: string,
  multiplayer = 1,
  decimals: { min: number; max: number },
) => {
  const fixed = Math.floor(decimals.min + Math.random() * (decimals.max - decimals.min + 1));
  return getRandomNumber(+min * multiplayer, +max * multiplayer).toFixed(fixed);
};

export const shuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const generateId = (length = 45) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const changeAddress = (address: string) => {
  let newAddress = address.slice(0, 6);
  newAddress += '*********************';
  newAddress += address.slice(address.length - 4, address.length);
  return newAddress;
};
