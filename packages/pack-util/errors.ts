import webpack from "webpack";
import stripAnsi from "strip-ansi";

import {
  captureArrayEntries,
  CapturedValue,
  ErrorData,
  unknownToErrorData,
} from "^jab";

import { mapModuleNotFound } from "./internal";

export type CustomWebpackError = {
  name: string;
  file?: string;
  message: string;
  module?: any;
};

/**
 * todo: use jab#mapErrorsForInclusionInJs
 */
export const mapWebpackErrors = (
  errors: CustomWebpackError[],
  moduleGraph: webpack.ModuleGraph
) => {
  const quickFixMessage: string[] = [];

  //uses ErrorData convention.
  const errorsAsJson = errors.map((error) => {
    const { msg, info, stack } = mapWebpackError(error, moduleGraph);

    //extra debug infos
    const allInfo: CapturedValue[] = [...captureArrayEntries([]), ...info];

    quickFixMessage.push(msg);

    return `{msg:${JSON.stringify(msg)}, info:${JSON.stringify(
      allInfo
    )}, stack:${JSON.stringify(stack)}}`;
  });

  return { errorsAsJson, quickFixMessage };
};

/**
 *
 */
export const mapWebpackError = (
  error: CustomWebpackError,
  moduleGraph: webpack.ModuleGraph
): ErrorData => {
  //for parse error

  if (error.name === "ModuleParseError" && !error.file) {
    return {
      msg: filterWebpackErrorMessage(error.message, error.file),
      info: [],
      stack: unknownToErrorData((error as any).error).stack,
    };
  }

  //for module not found error

  if (error.name === "ModuleNotFoundError" && !error.file) {
    return mapModuleNotFound(error, moduleGraph);
  }

  //the file might be a source position

  if (error.file) {
    return {
      msg: filterWebpackErrorMessage(error.message, error.file),
      info: [],
      stack: {
        type: "parsed",
        stack: [
          {
            line: (error as any)?.loc?.start?.line,
            file: error.file,
          },
        ],
      },
    };
  }

  //fallback to show webpack's stack trace

  return {
    msg: filterWebpackErrorMessage(error.message, error.file),
    info: [],
    stack: unknownToErrorData(error).stack,
  };
};

/**
 *
 */
export const filterWebpackErrorMessage = (message: string, file?: string) =>
  stripAnsi(message)
    .replace("[tsl] ERROR in " + file, "")

    //for "Module not found" errors, that used to be polyfilled.
    .replace(
      /BREAKING CHANGE: webpack[^]*resolve\.fallback: \{ ".*": false \}\s*/,
      ""
    )
    .replace(/^\(\d+,\d+\)\r?\n\s*/, "");
