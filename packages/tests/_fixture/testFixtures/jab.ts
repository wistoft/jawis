import { TestProvision } from "^jarun";
import { ClonedValue, clonedTosGeneral, ErrorData, sleeping } from "^jab";
import { diff, dynamicDiff } from "^jawis-util/algs";

export const errorData = (msg: string): ErrorData => ({
  msg,
  info: [],
  stack: "some stack",
});

export const errorData0: ErrorData = {
  msg: "Error message",
  info: [],
  stack: "some stack",
};

export const errorData1: ErrorData = {
  msg: "Some message from server",
  info: [],
  stack: `Error: RawJabError: find values :-)
    at Object.exports.err (C:\\devSite\\src\\jab\\error.ts:29:9)
    at C:\\packages\\jase\\jaseHandler.ts:48:7
    at Layer.handle [as handle_request] (C:\\node_modules\\express\\lib\\router\\layer.js:95:5)`,
};

export const errorData2: ErrorData = {
  msg: "Some browser error",
  info: [null, ["undefined"], NaN],
  stack: `onClick@webpack-internal:///./packages/jadev/react/_dev/HelloErrors.tsx:17:27
onClick@webpack-internal:///./packages/jab/react/JsLink.tsx:32:16`,
};

/**
 *
 */
export const diff_test = (str: string, right: string) => diff(str, right, 1);

/**
 *
 */
export const dynamicDiff_test = (left: string[], right: string[]) =>
  dynamicDiff(left, right, (l, r) => l === r);

export const cloneTosGeneral_test = (value: ClonedValue) =>
  clonedTosGeneral(value, {
    true: "TRUE",
    false: "FALSE",
    null: "NULL",
    undefined: "UNDEFINED",
    Infinity: "INFINITY",
    NaN: "NAN",
    circular: "circular",
    MaxDepth: "MaxDepth",

    "number-prefix": "number-prefix",
    "bigint-prefix": "bigint-prefix",
    "symbol-prefix": "symbol-prefix",
    "date-prefix": "date-prefix",
    "set-prefix": "set-prefix",
    "map-prefix": "map-prefix",
    "function-prefix": "function-prefix",

    "array-buffer-prefix": "array-buffer-prefix",
    "shared-array-buffer-prefix": "shared-array-buffer-prefix",
    "data-view-prefix": "data-view-prefix",
    "typed-array-prefix": "typed-array-prefix",

    "blank-string": "blank-string",
    space: "space",
    tab: "tab",
    newline: "newline",

    "brace-start": "(",
    "brace-end": ")",
    "bracket-start": "<",
    "bracket-end": ">",
  });

/**
 *
 */
export const youWaitedForMe = (prov: TestProvision) =>
  sleeping(10).then<unknown>(() => {
    prov.imp("You waited for me :-)");
  });
