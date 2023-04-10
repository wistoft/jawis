import fs from "fs";
import path from "path";

import { assertString, undefinedOr, isInt } from "^jab";
import {
  execSilent,
  execSyncAndGetStdout,
  MainProv,
  MakeJabProcess,
  makePlainJabProcess,
  Process,
} from "^jab-node";
import { BeeRunner } from "^jarun";
import { makeJatesRoute } from "^jates";
import { makeJagosRoute } from "^jagos";
import { makeApp, Route } from "^jab-express";
import { FinallyFunc } from "^finally-provider";

import { JaviClientConf, makeJarunTestRunners } from "./internal";

export type Deps = {
  name: string;
  mainProv: MainProv;
  serverPort: number;
  staticWebFolder: string;
  clientConf: JaviClientConf;
  jates: Omit<Parameters<typeof makeJatesRoute>[0], | "createTestRunners" | "makeTsProcess" | "onError" | "finally" | "logProv">; // prettier-ignore
  jagos: Omit<Parameters<typeof makeJagosRoute>[0], "onError" | "finally" | "logProv">; // prettier-ignore
  makeRoutes?: Route[];
};

/**
 * - Configure routes for jates and jagos.
 * - Add additional routes, defined in deps.
 * - Start web server
 *
 * note
 *  - this caters for both production and dev sites. (to avoid code duplication.)
 */
export const startJaviServer = async (deps: Deps) => {
  const { onError, finalProv, logProv } = deps.mainProv;

  //jates

  const jates: Route = {
    type: "serverApp",
    path: "/jate",
    makeHandler: () =>
      makeJatesRoute({
        createTestRunners: makeJarunTestRunners,
        makeTsProcess: makeTsNodeJabProcess,
        onError,
        finally: finalProv.finally,
        logProv,
        ...deps.jates,
      }),
  };

  //jagos

  const jagos: Route = {
    type: "serverApp",
    path: "/jago",
    makeHandler: () =>
      makeJagosRoute({
        onError,
        finally: finalProv.finally,
        logProv,
        ...deps.jagos,
      }),
  };

  // prefetch index.html

  const indexHtml = await fs.promises
    .readFile(path.join(deps.staticWebFolder, "index.html"))
    .then((data) => data.toString());

  // app

  const app = makeApp({
    staticWebFolder: deps.staticWebFolder,
    mainProv: deps.mainProv,
    makeRoutes: [jates, jagos, ...(deps.makeRoutes || [])],
    clientConf: {
      variable: "__JAVI_CLIENT_CONF",
      value: deps.clientConf,
    },
    indexHtml,
  });

  // start server

  app.listen(deps.serverPort, () =>
    deps.mainProv.log(deps.name + " port: " + deps.serverPort)
  );
};

/**
 *
 */
export const makeProcessRunner = (deps: {
  makeTsProcess: MakeJabProcess;
  finally: FinallyFunc;
}) => {
  const makeTsProcessConditonally = makeMakeTsJabProcessConditionally(
    deps.makeTsProcess
  );

  return new BeeRunner({
    ...deps,
    makeBee: makeTsProcessConditonally,
  });
};

/**
 *
 */
export const makeMakeTsJabProcessConditionally =
  (makeTsJabProcess: MakeJabProcess): MakeJabProcess =>
  (deps) => {
    if (deps.filename.endsWith(".ts") || deps.filename.endsWith(".tsx")) {
      return makeTsJabProcess(deps);
    } else {
      return makePlainJabProcess(deps);
    }
  };

/**
 *
 */
export const makeTsNodeJabProcess: MakeJabProcess = (deps) => {
  if (deps.execArgv && deps.execArgv.length > 0) {
    throw new Error("not impl");
  }

  const tsNodeArgs = [
    "-r",
    "ts-node/register/transpile-only",
    "-r",
    "tsconfig-paths/register",
  ];

  const nodeArgs = [...tsNodeArgs];

  return new Process({
    ...deps,
    execArgv: nodeArgs,
    cwd: path.dirname(deps.filename),
  });
};

/**
 *
 */
export const openFileInVsCode = (file: string, line?: number) => {
  let fileSpec = file;

  if (line) {
    fileSpec += ":" + line;
  }

  const stdoutNoisy = execSyncAndGetStdout(
    "C:\\Program Files\\Microsoft VS Code\\Code.exe",
    ["-g", fileSpec]
  );

  //this doesn't filter exceptions in `execSyncAndGetStdout`
  const stdout = stdoutNoisy
    .replace(
      "(electron) Sending uncompressed crash reports is deprecated and will be removed in a future version of Electron. Set { compress: true } to opt-in to the new behavior. Crash reports will be uploaded gzipped, which most crash reporting servers support.",
      ""
    )
    .trim();

  if (stdout !== "") {
    //the information that `execSyncAndGetStdout` gives isn't presented here.
    throw new Error("Message from vs code: " + JSON.stringify(stdout));
  }
};

/**
 *
 */
export const handleOpenFileInVsCode = (
  msg: {
    file: string;
    line?: number;
  },
  baseFolder = ""
) => {
  const file = assertString(msg.file);
  const line = undefinedOr(isInt)(msg.line);
  openFileInVsCode(path.join(baseFolder, file), line);
};

/**
 *
 */
export const compareFiles = (file1: string, file2: string) =>
  execSilent("C:\\Program Files (x86)\\WinMerge\\WinMergeU.exe", [
    file1,
    file2,
  ]);
