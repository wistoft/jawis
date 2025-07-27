import path from "node:path";
import { RequestOptions } from "node:http";
import fs from "node:fs";
import os from "node:os";
import fse from "fs-extra";

import {
  LogProv,
  tryProp,
  ErrorData,
  assert,
  OnError,
  OnErrorData,
  AbsoluteFile,
  LogEntry,
  makeJabError,
  getRandomString,
} from "^jab";
import { TestProvision } from "^jarun";
import {
  MainProv,
  httpRequest,
  listFilesRecursiveSync,
  makeAbsolute,
} from "^jab-node";
import { WsUrl } from "^jab-express";
import { FinallyFunc, FinallyProvider } from "^finally-provider";

/**
 *
 */
export type TestMainProv = {
  log: (logName: string, ...value: unknown[]) => void;
  logStream: (logName: string, value: string) => void;
  onError: OnError;
  onErrorData: OnErrorData;
  finally: FinallyFunc;
};

/**
 *
 */
export const getDefaultServerConf = (): WsUrl => ({
  host: "localhost",
  port: 4000,
  path: "ws",
});

/**
 * So please don't use this port number for anything.
 */
export const getUnusedPort = () => 6666;

/**
 * quick fix, because node adds ascii to output
 */
export const consoleLog = (...args: any[]) => {
  const mapped = args.map((arg) => JSON.stringify(arg));
  console.log(...mapped);
};

/**
 *
 */
export const getScriptPath = (script = "") =>
  path.join(__dirname, "../scripts", script) as AbsoluteFile;

/**
 *
 */
export const getTsProjectPath = (file = "") =>
  path.join(__dirname, "../tsProject", file) as AbsoluteFile;

/**
 *
 */
export const getEsmProjectPath = (file = "") =>
  path.join(__dirname, "../projectEsm", file) as AbsoluteFile;

/**
 *
 */
export const getCommonJsProjectPath = (file = "") =>
  path.join(__dirname, "../projectCommonjs", file) as AbsoluteFile;

/**
 *
 */
export const getMonorepoProjectPath = (file = "") =>
  path.join(__dirname, "../monorepo", file) as AbsoluteFile;

/**
 *
 */
export const getFixturePath = (file = "") =>
  path.join(__dirname, "..", file) as AbsoluteFile;

/**
 *
 */
export const getProjectPath = (file = "") =>
  path.join(__dirname, "../../../../", file) as AbsoluteFile;

/**
 * - ensure it exists, because it might get deleted.
 */
export const getScratchPath = (script = "") =>
  path.join(getTmpFolder("tests-scratchFolder"), script) as AbsoluteFile;

/**
 *
 */
export const getTmpFolder = (sub: string) => {
  const folder = path.join(os.tmpdir(), "jawis", sub);

  fse.ensureDirSync(folder);

  return folder;
};

/**
 *
 */
export const makeTempFile = (content: string) => {
  const file = makeAbsolute(getTmpFolder(""), getRandomString());

  fs.writeFileSync(file, content);

  return file;
};

/**
 *
 */
export const emptyScratchFolder = () => {
  const folder = getScratchPath();
  fse.emptyDirSync(folder);

  return folder;
};

/**
 *
 */
export const filterAbsoluteFilepath = (file: string) => {
  assert(path.isAbsolute(file), "File must be absolute", file);

  return "abs:" + path.relative(getProjectPath(), file).replace(/\\/g, "/");
};

/**
 *
 */
export const filterAbsoluteFilepathInFreetext = (text: string) =>
  text.replace(/\\/g, "/").replaceAll(getProjectPath(), "abs:");

/**
 *
 */
export const filterAbsoluteFilesInStdout = (prov: TestProvision) => {
  prov.filter("console.log", (...val: unknown[]) =>
    val.map(filterAbsoluteFilepathInFreetext as any)
  );
};

/**
 *
 */
export const writeScriptFileThatChanges2 = (value: number) => {
  writeScriptFileThatChanges(value, "FileThatChanges2.js");
};

/**
 *
 */
export const writeScriptFileThatChanges = (
  value: number,
  name = "FileThatChanges.js"
) => {
  const code = "module.exports = " + value + ";";
  fs.writeFileSync(getScratchPath(name), code);
};

/**
 *
 */
export const logFolder = (prov: TestProvision, folder: AbsoluteFile) => {
  for (const file of listFilesRecursiveSync(folder)) {
    prov.log(
      file.replace(new RegExp("^.*(tests-scratchFolder.*$)"), "$1"),
      fs.readFileSync(file).toString()
    );
  }
};

/**
 *
 */
export const makeGetIntegerSequence = () => {
  let i = 144000;
  return () => i++;
};

/**
 *
 */
export const testHttpRequest = (deps?: RequestOptions) =>
  httpRequest({
    hostname: "localhost",
    port: 4000,
    path: "/",
    ...deps,
  });

/**
 *
 */
export const filterUhPromise = (prov: TestProvision) => {
  prov.filter("console.log", (...val: unknown[]) => {
    if (val[0] === "uh-promise:") {
      const msg = tryProp(val[1], "message");
      return ["uh-promise filtered: " + msg];
    } else {
      return val;
    }
  });
};

/**
 *
 */
export const filterNodeDeprecation = (prov: TestProvision, errno: string) => {
  prov.filter("console.error", (...val: unknown[]) => {
    if (
      val[0] ===
        "(Use `node --trace-deprecation ...` to show where the warning was created)" ||
      (typeof val[0] === "string" &&
        val[0].includes(`[${errno}] DeprecationWarning`))
    ) {
      return [];
    } else {
      return val;
    }
  });
};

/**
 *
 */
export const filterReact = (prov: TestProvision) => {
  prov.filter("console.error", (...val: unknown[]) => {
    if (val.length === 0 || typeof val[0] !== "string") {
      return val;
    }

    if (
      val[0].startsWith("The above error occurred in the") ||
      val[0].includes("useLayoutEffect does nothing on the server")
    ) {
      return [];
    } else {
      return val;
    }
  });
};

/**
 *
 */
export const getLogProv = (prov: TestProvision, logPrefix = ""): LogProv => ({
  log: (...args) => {
    prov.log(logPrefix + "log", args);
  },
  logStream: (type, data) => {
    prov.logStream(logPrefix + type, data.toString());
  },
  status: (type, status) => {
    prov.log(logPrefix + "log", type + " is " + status);
  },
});

/**
 *
 */
export const getMainProv = (prov: TestProvision, logPrefix = ""): MainProv => {
  const logProv = getLogProv(prov, logPrefix);
  const finalProv = new FinallyProvider({ onError: prov.onError });

  return {
    onError: prov.onError,
    onErrorData: makeOnErrorData(prov),
    finalProv,
    finally: finalProv.finally,
    logProv,
    log: logProv.log,
    logStream: logProv.logStream,
  };
};

/**
 *
 */
export const makeOnErrorData = (prov: TestProvision) => (err: ErrorData) => {
  prov.imp(filterErrorDataStack(err));
};

/**
 *
 */
export const filterErrorDataStack = (err: ErrorData) => ({
  ...err,
  stack: "filtered",
});

/**
 *
 */
export const getErrorForPrint = (error?: Error) => {
  const e = error || new Error("ups");
  e.stack = "Error message and stack filtered";
  return e;
};
/**
 *
 */
export class ThrowInToString {
  public toString() {
    throw new Error("thrown in toString");
  }
}

/**
 *
 */
export const removeCarriageReturn = (data: string) => data.replace(/\r/g, "");

export const empty = new TextEncoder().encode("");
export const data1 = new TextEncoder().encode("data");
export const data2 = new TextEncoder().encode("1234");
export const data3 = new Uint8Array([11, 22, 33, 44]);
export const data4 = new Uint8Array([55, 66, 77, 88]);

/**
 *
 */
export const makeOnLog = (prov: TestProvision) => (msg: LogEntry) => {
  switch (msg.type) {
    case "log": {
      const logName = "onLog." + msg.logName;
      const old = (prov as any).logs.user[logName] ?? [];

      (prov as any).logs.user[logName] = [...old, ...msg.data];
      return;
    }

    case "stream": {
      prov.logStream("onLog." + msg.logName, msg.data);
      return;
    }

    case "html": {
      prov.onError(makeJabError("Combining html entries is not impl", msg));
      return;
    }

    case "error": {
      prov.onErrorData(msg.data);
      return;
    }

    default: {
      prov.onError(makeJabError("Unknown log type", msg));
      return;
    }
  }
};
