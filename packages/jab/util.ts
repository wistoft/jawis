import { err, FinallyProv, looping } from ".";
import { assert } from "./error";

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
export function indent(str: string, amount = 1, indentChar = "\t") {
  if (str === "") {
    return "";
  }

  let tabs = "";

  for (let i = 0; i < amount; i++) {
    tabs += indentChar;
  }

  return str.replace(/\n/g, "\n" + tabs);
}

/**
 * Return the the next element in the array. If end-of-array the first element is returned.
 */
export const arrayCircularNext = <T extends {}>(arr: T[], curIdx: number) => {
  let idx = curIdx + 1;

  if (idx >= arr.length) {
    idx = 0;
  }

  return arr[idx];
};

/**
 * Return the the prev element in the array. If start-of-array the last element is returned.
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
export const getRandomInteger = (max = 1000000) => getRandomRange(0, max);

/**
 *
 */
export function getRandomString(length: number) {
  return "" + Math.max(1, Math.round(Math.random() * Math.pow(10, length)));
}

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
export const fixErrorInheritence = (obj: {}, cls: {} | null) => {
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
 *
 */
export type FinallyProviderDeps = {
  onError: (error: unknown, extraInfo?: Array<unknown>) => void;
};

/**
 * Register finally functions, and run them all before shutdown.
 */
export class FinallyProvider implements FinallyProv {
  private finallyFuncs: Array<() => void | undefined | Promise<void>> = [];
  private active = true;

  constructor(private deps: FinallyProviderDeps) {}

  /**
   *
   */
  public isActive = () => this.active;

  /**
   * Register a function to run before shutdown.
   */
  public finally = (func: () => void | undefined | Promise<void>) => {
    if (!this.active) {
      err("Not active.");
    }

    this.finallyFuncs.push(func);
  };

  /**
   * Run all the registered functions serially.
   */
  public runFinally = () => {
    assert(this.active, "Has already run finally functions.");

    this.active = false;

    return looping(this.finallyFuncs, (finalTasks) =>
      Promise.resolve() //
        .then(() => finalTasks())
        .catch((error: unknown) => {
          this.deps.onError(error, ["Finally threw."]);
        })
    );
  };
}

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
