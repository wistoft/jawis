import path from "path";
import fs from "fs";
import fse from "fs-extra";

import { RequestOptions } from "http";

import { TestProvision } from "^jarun";
import { LogProv, tryProp, FinallyFunc, ErrorData } from "^jab";

import { httpRequest, WsUrl } from "^jab-node";

/**
 *
 */
export type TestMainProv = {
  log: (logName: string, ...value: unknown[]) => void;
  logStream: (logName: string, value: string) => void;
  onError: (error: unknown, extraInfo?: Array<unknown>) => void;
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
export const emptyScratchFolder = () => fse.emptyDirSync(getScratchPath());

/**
 *
 */
export const getScriptPath = (script: string) =>
  path.join(__dirname, "../scripts", script);

/**
 *
 */
export const getTsProjectPath = (file: string) =>
  path.join(__dirname, "../tsProject", file);

/**
 *
 */
export const getFixturePath = (file: string) =>
  path.join(__dirname, "..", file);

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
export const filterErrorDataStack = (err: ErrorData) => ({
  ...err,
  stack: "filtered",
});

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
