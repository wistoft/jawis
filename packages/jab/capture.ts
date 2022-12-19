import {
  err,
  isPlainObject,
  objMap,
  isNode,
  getProtoChain,
  assert,
  CustomCapture,
  CapturedValue,
  CapturedNonPlainObject,
} from ".";

const MAX_DEPTH = 10;

type Context = {
  seenStack: Array<unknown>;
  nodeCount: number;
  customCapture: CustomCapture; //return null to have no effect.
};

/**
 * Captures only the entries in the array. No the array itself.
 */
export const captureArrayEntries = (
  value: unknown[],
  maxDepth = MAX_DEPTH,
  customCapture: CustomCapture = () => null
) => {
  const context = {
    seenStack: [],
    nodeCount: 0,
    customCapture,
  };

  return value.map((elm) => internalCapture(elm, maxDepth - 1, context));
};

/**
 * Capture a javascript value, and preserve as much information as possible.
 *
 * - Deep clone. Has no reference to the input value, so it may mutate after this has returned.
 * - Is transferrable via JSON encoding.
 * - Detects cycles.
 * - Preserves as much information as possible.
 * - Has max depth.
 *
 * Todo
 * - Protection against large values. Isn't it just having a max node count?
 */
export const capture = (
  value: unknown,
  maxDepth = MAX_DEPTH,
  customCapture: CustomCapture = () => null
): CapturedValue =>
  internalCapture(value, maxDepth, {
    seenStack: [],
    nodeCount: 0,
    customCapture,
  });

/**
 *
 */
const internalCapture = (
  value: unknown,
  maxDepth = MAX_DEPTH,
  context: Context
): CapturedValue => {
  // detect cycles

  if (context.seenStack.indexOf(value) !== -1) {
    return ["circular"];
  }

  // work

  context.seenStack.push(value);
  const tmp = coreCapture(value, maxDepth, context);
  context.seenStack.pop();
  return tmp;
};

/**
 *
 */
const coreCapture = (
  value: unknown,
  maxDepth: number,
  context: Context
): CapturedValue => {
  context.nodeCount++;

  //custom

  const tmp = context.customCapture(value);
  if (tmp !== null) {
    return tmp.replace;
  }

  //default

  switch (typeof value) {
    case "boolean":
    case "string":
      return value;

    case "undefined":
      return ["undefined"];

    case "number":
      if (value === Infinity) {
        return ["Infinity"];
      }
      if (isNaN(value)) {
        return ["NaN"];
      }
      return value;

    case "symbol":
      return ["symbol", value.toString()];

    case "bigint":
      return ["bigint", value.toString()];

    case "function":
      return ["function", value.name || "anonymous"];

    case "object":
      if (value === null) {
        return null;
      }

      if (maxDepth <= 0) {
        return ["MaxDepth"];
      }

      return captureObjectish(value, maxDepth - 1, context) as CapturedValue;

    default:
      throw err("Unknown type: ", value); //typeof makes assertNever impossible.
  }
};

/**
 *
 */
const captureObjectish = (
  value: {},
  maxDepth: number,
  context: Context
): CapturedValue => {
  //can't be combined with the below if-else.

  if (typeof SharedArrayBuffer !== "undefined") {
    if (value instanceof SharedArrayBuffer) {
      return ["SharedArrayBuffer", value.byteLength];
    } else if (
      value instanceof Int8Array ||
      value instanceof Uint8Array ||
      value instanceof Uint8ClampedArray ||
      value instanceof Int16Array ||
      value instanceof Uint16Array ||
      value instanceof Int32Array ||
      value instanceof Uint32Array ||
      value instanceof Float32Array ||
      value instanceof Float64Array ||
      value instanceof BigInt64Array ||
      value instanceof BigUint64Array
    ) {
      assert(isNode(), "not implemented for browsers");
      const buf = Buffer.from(value);

      return [
        "TypedArray",
        {
          type: Object.getPrototypeOf(value).constructor.name,
          length: value.length,
          base64: buf.slice(0, 256).toString("base64"),
        },
      ];
    }
  }

  //the rest

  if (Array.isArray(value)) {
    return [
      "value",
      value.map((elm) => internalCapture(elm, maxDepth, context)),
    ];
  } else if (isPlainObject(value)) {
    //
    return objMap(value, (key, value) =>
      internalCapture(value, maxDepth, context)
    );
    //
  } else if (value instanceof Date && value.constructor === Date) {
    //
    return ["date", value.toISOString()];
    //
  } else if (value instanceof Set && value.constructor === Set) {
    //
    return [
      "set",
      internalCapture(Array.from(value.values()), maxDepth, context),
    ];
    //
  } else if (value instanceof Map && value.constructor === Map) {
    //
    return [
      "map",
      internalCapture(Array.from(value.entries()), maxDepth, context),
    ];
    //
  } else if (value instanceof ArrayBuffer) {
    //
    return ["ArrayBuffer", value.byteLength];
    //
  } else if (value instanceof DataView) {
    //
    return ["DataView", value.byteLength];
    //
  } else {
    const protoChain = getProtoChain(value);

    const fields = objMap(value, (key, value) =>
      internalCapture(value, maxDepth, context)
    );

    const result: CapturedNonPlainObject = { protoChain, fields };

    if (
      typeof value.toString === "function" &&
      value.toString !== Object.prototype.toString
    ) {
      result.toStringValue = value.toString();
    }

    return ["object", result];
  }
};
