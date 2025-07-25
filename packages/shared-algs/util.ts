import { assert, def } from "^jab";

/**
 *
 * - Writes little endian, because that's easiest.
 * - Checks that the number isn't truncated.
 */
export const writeNumber = (
  target: Uint8Array,
  offset: number,
  value: number,
  numBytes: number,
  errorMessage = "Not enough space for value."
) => {
  let tmp = value;

  for (let i = 0; i < numBytes; i++) {
    target[offset + i] = tmp & 0xff;
    tmp = tmp >> 8;
  }

  assert(tmp === 0, errorMessage, {
    value,
    tmp,
    numBytes,
  });
};

/**
 *
 */
export const readNumber = (
  source: Uint8Array,
  offset: number,
  numBytes: number
) => {
  let value = 0;
  let shift = 0;

  for (let i = 0; i < numBytes; i++) {
    value += def(source[offset + i] << shift);
    shift += 8;
  }

  return value;
};

/**
 * Round up to divisible by four.
 *
 * @source https://www.npmjs.com/package/sharedmap
 */
export function align32(v: number) {
  return (v & 0xffffffffffffc) + (v & 0x3 ? 0x4 : 0);
}

/**
 * todo: should be able to use 'equal' library.
 */
export const equal = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
};
