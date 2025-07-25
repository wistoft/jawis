import { makeHandleStdio } from "^stdio-protocol";
import { ErrorData, LogEntry } from "^jab";

import { TestProvision } from "^jarunc";
import { filterAbsoluteFilepath, TestMainProv } from ".";

/**
 *
 */
export const filterStackTraceForLogging_onLog =
  (prov: TestProvision) => (entry: LogEntry) => {
    if (entry.type === "error") {
      prov.imp(filterStackTraceForLogging(entry.data));
    } else {
      prov.log("log", entry);
    }
  };

/**
 *
 */
export const filterStackTraceForLogging = (data: ErrorData) => {
  if (data.stack.type !== "parsed") {
    throw new Error("only jacs supported.");
  }

  return data.stack.stack
    .filter(
      (elm) =>
        elm.file?.includes("\\tests\\") ||
        elm.file?.includes("/tests/") ||
        elm.file === "-----"
    )
    .map((elm) => {
      const clone = { ...elm };

      if (clone.file) {
        clone.file = filterAbsoluteFilepath(clone.file);
      }

      if (clone.rawFile) {
        clone.rawFile = filterAbsoluteFilepath(clone.rawFile);
      }

      return clone;
    });
};

/**
 *
 */
export const filterLongStackTrace = (data: ErrorData) => {
  if (data.stack.type !== "parsed") {
    throw new Error("only jacs supported.");
  }

  return data.stack.stack
    .filter(
      (elm) =>
        elm.file?.includes("\\tests\\") ||
        elm.file?.includes("/tests/") ||
        elm.file === "-----"
    )
    .map((elm) => {
      if (elm.file === "-----") {
        if (elm.func) {
          return `----- ${elm.func}`;
        } else {
          return "-----";
        }
      } else {
        return elm.func;

        // let extra;

        // extra = "";
        // extra = elm.line + " - ";

        // return `${extra}${elm.func} - ${
        //   elm.file &&
        //   path.relative(projectConf.packageFolder, elm.file).replace(/\\/g, "/")
        // }`;
      }
    });
};

/**
 *
 */
export const makeHandleStdio_test = (prov: TestMainProv) => {
  const stdioProtocolId = 123456;

  const { handleStdio } = makeHandleStdio(
    (msg) => prov.log("onMessage", msg),
    (data: Buffer) => prov.logStream("onStdout", data.toString()),
    stdioProtocolId
  );

  return handleStdio;
};
