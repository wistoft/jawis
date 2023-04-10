import path from "path";
import { RequestOptions } from "http";
import fs from "fs";
import fse from "fs-extra";

import { TestProvision } from "^jarun";
import { LogProv, tryProp, ErrorData, OnError } from "^jab";
import { MainProv, httpRequest } from "^jab-node";
import { WsUrl } from "^jab-express";
import { FinallyFunc, FinallyProvider } from "^finally-provider";

/**
 *
 */
export type TestMainProv = {
  log: (logName: string, ...value: unknown[]) => void;
  logStream: (logName: string, value: string) => void;
  onError: OnError;
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
 * So please dont' use this port number for anything.
 */
export const getUnusedPort = () => 6666;

/**
 *
 */
export const getScriptPath = (script?: string) =>
  path.join(__dirname, "../scripts", script || "");

/**
 *
 */
export const getTsProjectPath = (file: string) =>
  path.join(__dirname, "../tsProject", file);

/**
 *
 */
export const getFixturePath = (file?: string) =>
  path.join(__dirname, "..", file || "");

/**
 *
 */
export const makeGetRandomInteger = () => {
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
export const getLogProv = (prov: TestProvision, logPrefix = ""): LogProv => ({
  log: (...args) => {
    prov.log(logPrefix + "log", args);
  },
  logStream: (type, data) => {
    prov.log(logPrefix + type, data);
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

/**
 * - ensure it exists, because it might get deleted.
 */
export const getScratchPath = (script?: string) => {
  const folder = path.join(__dirname, "../scratchFolder");

  fse.ensureDir(folder);

  return path.join(folder, script || "");
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
