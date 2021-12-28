import fs from "fs";
import path from "path";
import urlJoin from "url-join";
import { Worker, WorkerOptions } from "worker_threads";
import { StdioOptions } from "child_process";

import { err, MakeBee, RequireSenderMessage } from "^jab";

import {
  JabWorker,
  Process,
  MakeJabProcess,
  MakeNodeWorker,
  ProcessDeps,
} from ".";

import type { LoadFunction, ResolveFilename } from "..";
import { RealProcess } from "./RealProcess";

//We start TypeScript, so we need a large timeout :-)
export const TS_TIMEOUT = 4000;

/**
 *  identity implementation.
 */
export const makePlainJabProcess: MakeJabProcess = (deps) => new Process(deps);

/**
 *  identity implementation.
 */
export const makePlainWorkerBee: MakeBee = (deps) =>
  new JabWorker({ ...deps, makeWorker: makePlainWorker });

/**
 *  identity implementation.
 */
export const makePlainWorker: MakeNodeWorker = (
  filename: string,
  options?: WorkerOptions
) => new Worker(filename, options);

/**
 *
 */
export const makeMakeTsJabProcessConditionally = (
  makeTsJabProcess: MakeJabProcess
): MakeJabProcess => (deps) => {
  if (deps.filename.endsWith(".ts") || deps.filename.endsWith(".tsx")) {
    return makeTsJabProcess(deps);
  } else {
    return makePlainJabProcess(deps);
  }
};

const defaultWinPath = `${process.env.SYSTEMROOT}\\system32;${process.env.SYSTEMROOT};${process.env.SYSTEMROOT}\\System32\\Wbem;${process.env.SYSTEMROOT}\\System32\\WindowsPowerShell\\v1.0\\;`;

/**
 * I would have liked to call it makeBatBee.
 *
 *  - Need to put default window path in front, because mingw has binaries, that shadow the cmd.exe binaries.
 *
 * note
 *  - could also get original path from here:
 *    - HKEY_LOCAL_MACHINE\SYSTEM\ControlSet001\Control\Session Manager\Environment
 *    - HKEY_LOCAL_MACHINE\SYSTEM\ControlSet002\Control\Session Manager\Environment
 *    - HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment
 */
export const makeCommandBee: MakeBee = (deps) =>
  new RealProcess({
    ...deps,
    filename: deps.filename,
    env: {
      ...process.env,
      PATH: defaultWinPath + process.env.PATH,
    },
  });

/**
 *
 */
export const makePowerBee: MakeBee = (deps) =>
  new RealProcess({
    ...deps,
    filename: "powershell.exe",
    args: [deps.filename],
  });

/**
 * Get files required in the script.
 *
 *  - ignores node's native modules.
 *  - may send the same file multiple times.
 *
 * impl
 *  - Node caches _resolveFilename by parent&request, so the request the wrapper function will be
 *      called for each parent of a script. Which is pretty much all the places it's required.
 */
export const makeMakeRequireSender = (
  parentSend: (msg: RequireSenderMessage) => void
) => (original: ResolveFilename): ResolveFilename => (
  request,
  parent,
  isMain
) => {
  const filename = original(request, parent, isMain);

  if (filename !== "fs") {
    parentSend({ type: "require", file: filename, source: parent?.filename });
  }

  return filename;
};

/**
 * Get files required, even though they've already been loaded.
 *
 * note
 *  - load only returns module.exports, so it is hard to get hand on the filename.
 *  - calling _resolveFilename() seems to be lot of extra work.
 *    But it hits a cache: https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js#L465
 */
export const makeRequireSenderOld = (
  parentSend: (msg: RequireSenderMessage) => void
): LoadFunction =>
  //must be function declaration
  function requireSender(this, request, parent, isMain) {
    const filename = this._resolveFilename(request, parent, isMain);

    parentSend({ type: "require", file: filename, source: parent?.filename });

    const res = (this as any)._originalLoad(request, parent, isMain);

    return res;
  };

/**
 * Switch automatically between development and production version of a script.
 *
 */
export const getFileToRequire = (dir: string, file: string) => {
  const prod = path.join(dir, "compiled", file + ".js");
  const dev = path.join(dir, file + ".ts");

  const hasProd = fs.existsSync(prod);
  const hasDev = fs.existsSync(dev);

  if (hasProd && hasDev) {
    err("Prod and dev must not be present at the same time.");
  }

  if (hasProd) {
    return prod;
  }

  if (hasDev) {
    return dev;
  }

  throw err("Couldn't find prod or dev file.", { prod, dev });
};

/**
 * Switch automatically between development and production version of a script.
 */
export const getUrlToRequire = ({
  staticWebFolder,
  webRootUrl,
  liveFilepath,
  webcsUrl,
  devFilepath,
}: {
  staticWebFolder: string;
  webRootUrl: string;
  liveFilepath: string;
  webcsUrl: string;
  devFilepath: string;
}) => {
  const prod = path.join(staticWebFolder, liveFilepath); //live version

  if (fs.existsSync(prod)) {
    return urlJoin(webRootUrl, liveFilepath);
  }

  //must be development environment. It will be compiled on the fly.

  return urlJoin(webcsUrl, devFilepath);
};

/**
 *
 */
export const makeNoisyProcessDeps = (
  extraDeps: { filename: string } & Partial<ProcessDeps<{}>>
): ProcessDeps<{}> => {
  const stdio: StdioOptions = ["ignore", "pipe", "pipe", "ipc"];
  return {
    execArgv: [],
    stdio,
    onMessage: (message: unknown) => {
      console.log("MESSAGE: ", message);
    },
    onStdout: (data: Buffer) => {
      console.log(data.toString());
    },
    onStderr: (data: Buffer) => {
      console.log("STDERR: ", data.toString());
    },
    onError: (error: unknown) => {
      console.log("Process.onError: ", error);
    },
    onExit: (_status: number | null) => {
      // console.log(
      //   "Process.onExit, " + status + ", " + path.basename(extraDeps.filename)
      // );
    },
    onClose: () => {
      // console.log("Process.onClose");
    },
    finally: () => {
      //todo: finally registration not impl
    },
    ...extraDeps,
  };
};
