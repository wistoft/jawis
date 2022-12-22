import { assert } from "./error";
import { err, TypedArray, TypedArrayContructor } from ".";

/**
 *
 */
export const assertNever = (
  value: never,
  msg = "Never happened: ",
  ...args: Array<unknown>
): never => {
  throw err(msg, value, ...args);
};

/**
 * Basename/filename of a file path.
 *
 * - For node this is possible: path.basename
 * - @source: http://stackoverflow.com/questions/3820381/need-a-basename-function-in-javascript
 */
export function basename(path: string) {
  const res = path.split(/[\\/]/).pop();
  if (res) {
    return res;
  } else {
    return "";
  }
}

/**
 *
 * todo: fix bug, that first line isn't indented.
 */
export function indent(
  str: string,
  amount = 1,
  indentChar = "\t",
  firstLine?: string
) {
  if (str === "") {
    return firstLine ?? "";
  }

  let tabs = "";

  for (let i = 0; i < amount; i++) {
    tabs += indentChar;
  }

  const first = firstLine ?? tabs;

  return first + str.replace(/\n/g, "\n" + tabs);
}

/**
 * Return the next element in the array. If end-of-array the first element is returned.
 */
export const arrayCircularNext = <T extends {}>(arr: T[], curIdx: number) => {
  let idx = curIdx + 1;

  if (idx >= arr.length) {
    idx = 0;
  }

  return arr[idx];
};

/**
 * Return the prev element in the array. If start-of-array the last element is returned.
 */
export const arrayCircularPrev = <T extends {}>(arr: T[], curIdx: number) => {
  let idx = curIdx - 1;

  if (idx < 0) {
    idx = arr.length - 1;
  }

  return arr[idx];
};

/**
 * Get a random integer withnin the range.
 */
export const getRandomRange = (min: number, max: number) =>
  Math.floor(Math.random() * max) + min;

/**
 * A random non-negative integer.
 */
export const getRandomInteger = (max = Number.MAX_SAFE_INTEGER) =>
  Math.floor(Math.random() * max);

/**
 * A random length Uint8Array with random data.
 *
 * note: Can do this in node 15: https://nodejs.org/api/webcrypto.html#cryptogetrandomvaluestypedarray
 */
export const getRandomUint8Array = (maxLength = 1000) => {
  const length = Math.floor(Math.random() * maxLength);

  const array = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }

  return array;
};

/**
 * Check whether the runtime is node.js.
 */
export const isNode = () =>
  typeof global !== "undefined" &&
  {}.toString.call(global) === "[object global]";

/**
 * Fix inheritance when inheriting from native classes in node.js.
 *
 */
export const fixErrorInheritance = (obj: {}, cls: {} | null) => {
  if (isNode()) {
    Object.setPrototypeOf(obj, cls);
  }
};

/**
 * Omit fields from an object.
 *
 * - Only for own enumerable keys. Protype chain not preserved.
 */
export const objOmit = (obj: {} | null, ...props: string[]): unknown => {
  if (obj === null) {
    return null;
  }
  const res: any = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (props.indexOf(key) === -1) {
      res[key] = value;
    }
  });

  return res;
};

/**
 * Map a the values of an object.
 *
 * - Only for own enumerable keys. Protype chain not preserved.
 * - The map-function must handle `string | number` keys, because the object can be a any subtype.
 * - @alternatives https://stackoverflow.com/questions/14810506/map-function-for-objects-instead-of-arrays
 */
export const objMap = <T, S>(
  obj: { [key in string | number]: T },
  map: (key: string | number, value: T) => S
) => {
  const res: { [key in string | number]: S } = {};

  Object.entries(obj).forEach(([key, value]) => {
    res[key] = map(key, value);
  });

  return res;
};

/**
 *
 */
export const def = <T>(
  val: T | undefined | null
): Exclude<T, undefined | null> => {
  if (val === undefined || val === null) {
    throw new Error("Not defined");
  }
  return val as any;
};

/**
 * The prototype chain is returned as an array of names.
 */
export const getProtoChain = (obj: {}) => {
  const res: string[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const proto = Object.getPrototypeOf(obj);
    if (proto === null) {
      res.push("null");
      return res;
    } else if (
      proto === Object.prototype &&
      proto.constructor.name === "Object"
    ) {
      res.push("Object");
      return res;
    } else {
      res.push(proto.constructor.name);
      // dive down
      obj = proto;
    }
  }
};

/**
 * Split a string into three parts: the leading whitespace, the middle, the trailing whitespace.
 */
export const splitSurroundingWhitespace = (
  value: string
): [string, string, string] => {
  if (value === "") {
    return ["", "", ""];
  }

  // start

  let startIdx: number;
  let startStr: string;

  const matchStart = value.match(/^( |\n|\t)+/);

  if (matchStart === null) {
    startIdx = 0;
    startStr = "";
  } else {
    startIdx = matchStart[0].length;
    startStr = matchStart[0];

    //if all sting is white space
    if (matchStart[0].length === value.length) {
      return [startStr, "", ""];
    }
  }

  //end

  let endIdx: number;
  let endStr: string;

  const matchEnd = value.match(/( |\n|\t)+$/);

  if (matchEnd === null) {
    endIdx = value.length;
    endStr = "";
  } else {
    endIdx = -matchEnd[0].length;
    endStr = matchEnd[0];
  }

  //return

  return [startStr, value.slice(startIdx, endIdx), endStr];
};

/**
 *
 */
export function toBytes(str: string) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    if (result !== "") {
      result += " ";
    }
    result += str.charCodeAt(i);
  }
  return result;
}

/**
 * Convert from int32 or uint32 to readable bits.
 */
export function toBits(val: number) {
  if (!Number.isInteger(val)) {
    throw new Error("Number must be integer: " + val);
  }

  if (val > 0xffffffff) {
    throw new Error("Number too large: " + val);
  }

  return "0b" + Uint32Array.from([val])[0].toString(2);
}

/**
 *
 */
export const base64ToBinary = (str: string) => {
  if (isNode()) {
    return Buffer.from(str, "base64").toString("binary");
  } else {
    return window.atob(str);
  }
};

/**
 *
 */
export const binaryToBase64 = (str: string) => {
  if (isNode()) {
    return Buffer.from(str, "binary").toString("base64");
  } else {
    return window.btoa(str);
  }
};

/**
 * Convert a binary string to Uint8Array. The string must only contain chars in range: 0-255
 *
 * @source https://stackoverflow.com/questions/6965107/converting-between-strings-and-arraybuffers
 */
export const binaryStringToUInt8Array = (str: string) => {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
};

/**
 *
 */
export const numberOfRightZeroBits = (n: number) => {
  let mask = 1;

  for (let i = 0; i < 32; i++) {
    if ((mask & n) !== 0) {
      return i;
    }

    mask <<= 1;
  }

  throw new Error("Impossible");
};

/**
 * Calculating the number, where only the heighest bit is preserved.
 *
 * todo: implement faster.
 */
export const preserveHeighestBit = (n: number) => {
  if (n <= 0) {
    err("preserveHeighestBit: not impl");
  }

  return 2 ** Math.floor(Math.log2(n));
};

/**
 * Unfinished.
 *
 * Escape for $'' strings.
 *
 * see: https://www.gnu.org/software/bash/manual/html_node/ANSI_002dC-Quoting.html
 *
 * note
 *  - it's not possible to escape properly for $"", "" or '' string.
 */
export const escapeBashArgument = (str: string) =>
  str
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\?/g, "\\?");

/**
 *
 */
export const once = (func: () => void) => {
  let first = true;
  return () => {
    if (first) {
      first = false;
      func();
    }
  };
};

/**
 *
 */
export const refable = () => {
  const ref: { func: () => void; current?: () => void } = {
    func: () => {
      ref.current && ref.current();
    },
  };

  return ref;
};

/**
 * - only implements part of the constructor interface.
 */
export const makeTypedArray = <T extends TypedArray, U extends TypedArray>(
  source: T,
  TypedArray: TypedArrayContructor<U>,
  byteOffset: number,
  length: number
) => {
  //must check, because the buffer could have data, that would be wrong to return.

  assert(byteOffset >= 0, "Offset must be non-negative: " + byteOffset);

  //ensure we don't take data after the array as ended.

  const minimalLength = byteOffset + length * TypedArray.BYTES_PER_ELEMENT;

  if (source.byteLength < minimalLength) {
    err("Array isn't long enough. ", {
      source,
      target: TypedArray.name,
      byteOffset,
      length,
    });
  }

  //checks length isn't negative.

  return new TypedArray(source.buffer, source.byteOffset + byteOffset, length);
};

/**
 * todo
 *  - implement for browser. Maybe use: https://www.npmjs.com/package/base64-arraybuffer
 */
export const base64ToTypedArray = <T extends TypedArray>(
  str: string,
  TypedArray: TypedArrayContructor<T>
) => {
  const buffer = Buffer.from(str, "base64");

  return makeTypedArray(
    buffer,
    TypedArray,
    0,
    buffer.byteLength / TypedArray.BYTES_PER_ELEMENT
  );
};
