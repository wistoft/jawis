import {
  assert,
  err,
  TypedArray,
  TypedArrayContructor,
  WaitFunc,
} from "./internal";

declare const global: any;

/**
 * Deprecate a function
 *
 * - output a deprecation message only once.
 * - call the function with the args every time.
 */
export const deprecated = <T extends (...args: any[]) => any>(
  message: string,
  args: Parameters<T>,
  func: T
): ReturnType<T> => {
  const cache = (global["__jawis_deprecation_warned"] =
    global["__jawis_deprecation_warned"] ?? {});

  if (!cache[message]) {
    cache[message] = true;

    console.error(message);
  }

  return func(...args);
};

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
 * Get a random integer within the range.
 */
export const getRandomRange = (min: number, max: number) =>
  Math.floor(Math.random() * (max + 1 - min)) + min;

/**
 * A random non-negative integer.
 */
export const getRandomInteger = (max = Number.MAX_SAFE_INTEGER) =>
  Math.floor(Math.random() * (max + 1));

/**
 *
 */
export const getRandomLengthString = (chars: string[] = [], maxlength = 10) =>
  getRandomString(chars, getRandomInteger(maxlength));

/**
 *
 */
export const getRandomString = (_chars: string[] = [], length = 10) => {
  const chars =
    _chars.length !== 0
      ? _chars
      : [ "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9" ]; // prettier-ignore

  let res = "";

  for (let i = 0; i < length; i++) {
    res += chars[getRandomInteger(chars.length)];
  }

  return res;
};

export const getRandomArray = (length: number) => {
  const array: number[] = [];

  for (let i = 0; i < length; i++) {
    array.push(Math.floor(Math.random() * length));
  }

  return array;
};

export const getRandomElement = <T>(arr: T[]) =>
  arr[getRandomInteger(arr.length - 1)];

/**
 * A random length Uint8Array with random data.
 *
 * note: Can do this in node 15: https://nodejs.org/api/webcrypto.html#cryptogetrandomvaluestypedarray
 */
export const getRandomUint8Array = (min = 0, max = 1000) => {
  const length = getRandomRange(min, max);

  const array = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }

  return array;
};

/**
 *
 */
export const getRandomUint8Array_old = (maxLength = 1000) => {
  return getRandomUint8Array(0, maxLength);
};

/**
 *
 */
export const splitStringRandomly = (str: string) => {
  const res: string[] = [];
  let i = 0;

  while (i < str.length) {
    const next = getRandomInteger(10);

    res.push(str.slice(i, i + next));

    i += next;
  }

  assert(str === res.join(""));

  return res;
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

    //if everything is white space
    if (matchStart[0].length === value.length) {
      return [startStr, "", ""];
    }
  }

  //end

  let endIdx: number;
  let endStr: string;

  const matchEnd = value.match(/(?<! |\n|\t)(?: |\n|\t)+$/);

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
export function toJsCode(val: Uint8Array) {
  return `new Uint8Array([${Array.from(val.values()).join(", ")}])`;
}

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
 * source: https://stackoverflow.com/a/20403618
 */
export const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

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
 *
 * - will preserve the possibly underlying sharedArray, because `source.buffer`
 *    is used. Fx the following will not do that: `new Int32Array(source)`
 *
 * notes
 *  - only implements part of the constructor interface.
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

/**
 *
 */
export const difference = <T>(a: T[], b: T[]) => {
  const set = new Set(b);
  return a.filter((x) => !set.has(x));
};

/**
 *
 */
export const setDifference = <T>(a: Set<T>, ...bs: Set<T>[]) => {
  const res = new Set<T>();

  a.forEach((elm) => {
    for (const b of bs) {
      if (b.has(elm)) {
        return;
      }
    }

    res.add(elm);
  });

  return res;
};

/**
 *
 */
export const range = (amount: number, start: number, step: number) => {
  const res: number[] = [];
  let cur = start;

  for (let i = 0; i < amount; i++) {
    res.push(cur);
    cur += step;
  }

  return res;
};

/**
 *
 */
export const average = (arr: number[]) => {
  let cur = 0;

  for (let i = 0; i < arr.length; i++) {
    cur += arr[i];
  }

  return cur / arr.length;
};

/**
 *
 */
export const group = <T>(arr: T[], amount: number, fullGroups = false) => {
  let size = 0;
  let tmp: T[] = [];
  const res: T[][] = [];

  for (const val of arr) {
    tmp.push(val);

    size++;
    if (size == amount) {
      res.push(tmp);
      size = 0;
      tmp = [];
    }
  }

  if (tmp.length !== 0 && !fullGroups) {
    res.push(tmp);
  }

  return res;
};

/**
 *
 */
export const pastTimestamp = (days: number) =>
  Date.now() - days * 24 * 3600 * 1000;

/**
 *
 */
export const pathJoin = (...args: string[]) =>
  args.reduce<string>((a, b) => {
    if (a === "") {
      return b;
    }
    if (b === "") {
      return a;
    }

    return a.replace(/\/$/, "") + "/" + b.replace(/^\//, "");
  }, "");

/**
 *
 */
export function replaceGlobalClass(key: string, _new: any) {
  const original = global[key];

  global[key] = _new;

  return () => {
    global[key] = original;
  };
}

/**
 *
 */
export const makeDebounce = <T>(
  callback: (data: T) => void,
  timeoutDelay: number
) => makeThrottle(callback, timeoutDelay, true);

/**
 *
 * - Last-consistent, but not immediate-emitting.
 */
export const makeThrottle = <T>(
  callback: (data: T) => void,
  timeoutDelay: number,
  alwaysClearTimeout = false
) => {
  let timeoutHandle: any;
  let bufferedValue: any;

  const emit = () => {
    callback(bufferedValue);

    // set state

    timeoutHandle = undefined;
    bufferedValue = undefined;
  };

  return (data: T) => {
    if (alwaysClearTimeout && timeoutHandle !== undefined) {
      clearTimeout(timeoutHandle);
    }

    bufferedValue = data;

    if (timeoutHandle === undefined) {
      timeoutHandle = setTimeout(emit, timeoutDelay);
    }
  };
};

/**
 *
 * - sleepCondition is only used to check if the wait should continue in case of spurious wake.
 *    That's different from the condition for waiting. Though they could be the same.
 */
export function niceWait({
  sharedArray,
  index,
  value,
  timeout,
  softTimeout,
  sleepCondition,
  onSoftTimeout,
  waitName = "Wait",
  throwOnTimeout = false,
  wait = Atomics.wait,
  DateNow,
}: {
  sharedArray: Int32Array;
  index: number;
  value: number;
  timeout: number;
  softTimeout: number | undefined;
  sleepCondition: () => boolean;
  onSoftTimeout: () => void;
  waitName?: string;
  throwOnTimeout?: boolean | string;
  wait: WaitFunc;
  DateNow: () => number;
}) {
  if (softTimeout && softTimeout >= timeout) {
    throw new Error("Soft timeout " + softTimeout+" must be smaller than hard timeout: " + timeout); // prettier-ignore
  }

  const startTime = DateNow();
  let val: "ok" | "timed-out" | "not-equal";
  let actualTimeout: number | undefined = softTimeout || timeout;
  let hasBeenSoftTimeout = false;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    val = wait(sharedArray, index, value, actualTimeout); // prettier-ignore

    //give warning on first timeout

    if (val === "timed-out" && softTimeout && !hasBeenSoftTimeout) {
      //give warning

      onSoftTimeout();

      //setup to wait for next timeout

      actualTimeout = timeout - softTimeout;
      hasBeenSoftTimeout = true;
      continue;
    }

    //protect against spurious wake

    if (val === "ok" && sleepCondition()) {
      continue;
    }

    break;
  }

  //tell if wait responsed between first and second timeout

  if (val !== "timed-out" && hasBeenSoftTimeout) {
    console.log(waitName + " responded late, time: " + (DateNow() - startTime));
  }

  if (val === "timed-out" && throwOnTimeout) {
    throw new Error(
      waitName + " did not respond, time: " + (DateNow() - startTime)
    );
  }

  return val;
}
