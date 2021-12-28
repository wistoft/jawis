import path from "path";
import async_hooks from "async_hooks";

import { enable, disable } from "^jab";
import { ErrorData, RequireSenderMessage, WorkerBeeDeps } from "^jabc";
import { TestProvision } from "^jarun";

import { filterFilepath, getScriptPath, TestMainProv } from ".";

export const getBeeDeps = (
  prov: TestMainProv,
  extraDeps?: Partial<WorkerBeeDeps<any>>,
  logPrefix = "bee."
): WorkerBeeDeps<any> => ({
  filename: getScriptPath("hello.js"),
  onMessage: (msg: unknown) => {
    prov.log(logPrefix + "message", msg);
  },
  onLog: (entry) => {
    prov.log(logPrefix + "log", entry);
  },
  onStdout: (data: Buffer) => {
    prov.logStream(logPrefix + "stdout", data.toString());
  },
  onStderr: (data: Buffer) => {
    prov.logStream(logPrefix + "stderr", data.toString());
  },
  onExit: () => {},
  onError: prov.onError,
  finally: prov.finally,
  ...extraDeps,
});

/**
 *
 */
export const logRequireMessage = (msg: RequireSenderMessage) => {
  console.log({
    ...msg,
    file: filterFilepath(msg.file),
    source: msg.source && path.basename(msg.source),
  });
};

/**
 *
 */
export const enableLongTraceForTest = (prov: TestProvision) => {
  enable(async_hooks);
  prov.finally(disable);
};

/**
 *
 */
export const filterStackTrace = (data: ErrorData) => {
  if (data.stack.type !== "node-parsed") {
    throw new Error("only jacs supported.");
  }

  return data.stack.stack
    .filter((elm) => {
      return (
        elm.file?.includes("\\tests\\") ||
        elm.file?.includes("/tests/") ||
        elm.file === "-----"
      );
    })
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
