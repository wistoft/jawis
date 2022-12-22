import {
  assertNever,
  indent,
  base64ToBinary,
  splitSurroundingWhitespace,
  binaryStringToUInt8Array,
  capture,
  CapturedValue,
  CapturedNonPrimitiveValue,
  toBytes,
} from ".";

export type StringKeys =
  | "true"
  | "false"
  | "null"
  | "undefined"
  | "Infinity"
  | "NaN"
  | "circular"
  | "MaxDepth"
  | "number-prefix"
  | "bigint-prefix"
  | "symbol-prefix"
  | "date-prefix"
  | "set-prefix"
  | "map-prefix"
  | "function-prefix"
  | "array-buffer-prefix"
  | "shared-array-buffer-prefix"
  | "data-view-prefix"
  | "typed-array-prefix"
  | "blank-string"
  | "space"
  | "tab"
  | "newline"
  | "brace-start"
  | "brace-end"
  | "bracket-start"
  | "bracket-end";

export type Strings = { [K in StringKeys]: string };

/**
 *
 */
export const tos = (value: unknown) => capturedTos(capture(value));

/**
 *
 */
export const capturedArrayEntriesTos = (arr: CapturedValue[]) =>
  arr.reduce<string>(
    (acc, value) => acc + (acc === "" ? "" : "\n") + capturedTos(value),
    ""
  );

/**
 * converts a captured value to string.
 */
export const capturedTos = (value: CapturedValue) =>
  capturedTosGeneral(value, {
    true: "Boolean: true",
    false: "Boolean: false",
    null: "Null",
    undefined: "Undefined",
    Infinity: "Number: Infinity",
    NaN: "Number: NaN",
    circular: "circular",
    MaxDepth: "MaxDepth",

    "number-prefix": "Number: ",
    "bigint-prefix": "BigInt: ",
    "symbol-prefix": "Symbol: ",
    "date-prefix": "Date: ",
    "set-prefix": "Set: ",
    "map-prefix": "Map: ",
    "function-prefix": "Function: ",

    "array-buffer-prefix": "ArrayBuffer: ",
    "shared-array-buffer-prefix": "SharedArrayBuffer: ",
    "data-view-prefix": "DataView: ",
    "typed-array-prefix": "TypedArray: ",

    "blank-string": "Blank string",
    space: " ",
    tab: "\t",
    newline: "\n",

    "brace-start": "{",
    "brace-end": "}",
    "bracket-start": "[",
    "bracket-end": "]",
  });

/**
 * - All primitive values produced are configurable.
 * - Trusts, that capture handled max depth and circular references.
 */
export const capturedTosGeneral = (
  value: CapturedValue,
  strings: Strings
): string => {
  if (value === true) {
    return strings["true"];
  }

  if (value === false) {
    return strings["false"];
  }

  if (typeof value === "number") {
    return strings["number-prefix"] + value;
  }

  if (typeof value === "string") {
    return stringTos(value, strings);
  }

  if (typeof value === "object") {
    if (value === null) {
      return strings["null"];
    }

    if (Array.isArray(value)) {
      return arrayEncodedTos(value, strings);
    }

    //plain object
    return objectTos(value, strings);
  }

  throw assertNever(value, "Unknown captured value.");
};

/**
 *
 */
const stringTos = (value: string, strings: Strings) => {
  if (value === "") {
    return strings["blank-string"];
  }

  const [pre, middle, post] = splitSurroundingWhitespace(value);

  return (
    stringTosHelper(pre, strings) + middle + stringTosHelper(post, strings)
  );
};

/**
 * Replaces all values.
 *
 *  - Careful not to assume anything about the strings that are inserted.
 */
const stringTosHelper = (value: string, strings: Strings): string => {
  let res = "";

  for (let i = 0; i < value.length; i++) {
    if (value[i] === " ") {
      res += strings["space"];
    } else if (value[i] === "\t") {
      res += strings["tab"];
    } else if (value[i] === "\n") {
      res += strings["newline"];
    }
  }

  return res;
};

/**
 * - plain objects, for now.
 */
const objectTos = (obj: object, strings: Strings, name = ""): string => {
  const content = Object.entries(obj).reduce(
    (acc, [key, property]) =>
      acc +
      "\t" +
      key +
      ": " +
      indent(capturedTosGeneral(property, strings), 1) +
      "\n",
    ""
  );

  if (content === "") {
    return name + strings["brace-start"] + strings["brace-end"];
  } else {
    return (
      name + strings["brace-start"] + "\n" + content + strings["brace-end"]
    );
  }
};

/**
 *
 */
const arrayTos = (value: Array<CapturedValue>, strings: Strings) => {
  if (value.length === 0) {
    return strings["bracket-start"] + strings["bracket-end"];
  }

  const content = value.reduce(
    (acc, property) =>
      acc + ".\t" + indent(capturedTosGeneral(property, strings), 1) + "\n",
    ""
  );

  return strings["bracket-start"] + "\n" + content + strings["bracket-end"];
};

/**
 *
 */
const arrayEncodedTos = (
  value: CapturedNonPrimitiveValue,
  strings: Strings
) => {
  switch (value[0]) {
    case "undefined":
      return strings["undefined"];

    case "Infinity":
      return strings["Infinity"];

    case "NaN":
      return strings["NaN"];

    case "circular":
      return strings["circular"];

    case "MaxDepth":
      return strings["MaxDepth"];

    case "bigint":
      return strings["bigint-prefix"] + value[1];

    case "symbol":
      return strings["symbol-prefix"] + value[1];

    case "date":
      return strings["date-prefix"] + value[1];

    case "set":
      return strings["set-prefix"] + capturedTosGeneral(value[1], strings);

    case "map":
      return strings["map-prefix"] + capturedTosGeneral(value[1], strings);

    case "function":
      return strings["function-prefix"] + value[1];

    case "value":
      return arrayTos(value[1], strings);

    case "ArrayBuffer":
      return strings["array-buffer-prefix"] + value[1];

    case "SharedArrayBuffer":
      return strings["shared-array-buffer-prefix"] + value[1];

    case "DataView":
      return strings["data-view-prefix"] + value[1];

    case "TypedArray": {
      const t =
        strings["typed-array-prefix"] +
        value[1].type +
        "(" +
        value[1].length +
        ")";

      if (value[1].base64 === "") {
        return t;
      } else {
        const binaryString = base64ToBinary(value[1].base64);
        const buffer = binaryStringToUInt8Array(binaryString);
        const str = new TextDecoder().decode(buffer);
        return (
          t +
          "\n\t" +
          str +
          "\n\t" +
          toBytes(binaryString) +
          "\n\t" +
          value[1].base64
        );
      }
    }

    case "object": {
      const name = value[1].protoChain.join(" : ") + " ";

      const a = objectTos(value[1].fields, strings, name);

      if (value[1].toStringValue) {
        return a + "\n" + "toStringValue: " + value[1].toStringValue;
      } else {
        return a;
      }
    }

    case "promise": {
      let res = "";
      if (value[1].timeout) {
        res += "Timeout: " + value[1].timeout + "\n";
      }
      if (value[1].resolve) {
        res +=
          "Resolve: " + capturedTosGeneral(value[1].resolve, strings) + "\n";
      }
      if (value[1].reject) {
        res += "Reject: " + capturedTosGeneral(value[1].reject, strings) + "\n";
      }
      return res;
    }

    default: {
      const n: never = value[0]; // eslint-disable-line unused-imports/no-unused-vars

      return "Unknown encode pivot: " + tos(value[0]);
    }
  }
};
