import { assert, err } from "^jab";

export const busyWait = (ms: number) => {
  const start = Date.now();
  while (Date.now() - start < ms) {
    /* no op*/
  }
};

/**
 *
 */
export const setLeadZero = (str: string, length: number) => {
  while (str.length < length) str = "0" + str;

  return str;
};

/**
 *
 */
export const trimLeadingZero = (str: string) => {
  //reduce leading zeros
  str = str.replace(/^0+/, "0");

  if (str === "0") return "0";

  //remove leading zero
  return str.replace(/^0+/, "");
};

/*
 *
 */
export const getLeft = (str: string, amount: number) => {
  assert( amount <= str.length, "No more than strlen can be returned: ", amount, str ); // prettier-ignore

  return str.substring(0, amount);
};

/**
 *
 */
export const removeLeft = (str: string, amount: number) => {
  assert( amount <= str.length, "No more than strlen can be removed.", amount, str ); // prettier-ignore
  assert(amount >= 0, "amount must be positive int: ", amount);

  return str.substring(amount);
};

/**
 *
 */
export const removeRight = (str: string, amount: number) => {
  assert( amount <= str.length, "No more than strlen can be removed: ", amount, str ); // prettier-ignore
  assert(amount >= 0, "amount must be positive int: ", amount);

  return str.substring(0, str.length - amount);
};

/**
 *
 */
export const getRight = (str: string, amount: number) => {
  assert( amount <= str.length, "getRight() - No more than strlen can be returned: ", amount, str ); // prettier-ignore

  return str.substring(str.length - amount, str.length);
};
