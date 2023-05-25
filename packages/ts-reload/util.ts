import path from "path";

import {
  assertNever,
  basename,
  err,
  LogProv,
  CapturedStack,
  ParsedStackFrame,
  capturedArrayEntriesTos,
} from "^jab";

import { MainProv, mainWrapper } from "^jab-node";
import { MakeMakeJacsBeeDeps, makeMakeJacsWorkerBee } from "^jacs";
import { parseNodeTrace } from "^parse-captured-stack";
import { MakeBee } from "^bee-common";

import { ScriptOutput, ScriptStatusTypes } from "^jagoc";
import { ScriptDefinition, ScriptPoolController } from "^jagos";

export type CliOptions = {
  files: string[];
  config: string;
  cacheResolve: boolean;
  indexPrefix: boolean;
  lazy: boolean;
  longTraces: boolean;
};

export type FullTsReloadConf = {
  scripts: ScriptDefinition[];
  cacheNodeResolve: boolean;
  lazyRequire: boolean;
  enableLongTraces: boolean;
  module: "commonjs" | "esm";
  indexPrefix: boolean;
};

export type DirectorDeps = MainProv &
  FullTsReloadConf & {
    //for testing
    makeMakeJacsWorkerBee: (deps: MakeMakeJacsBeeDeps) => MakeBee;
    onStatusChange?: (script: string, status: ScriptStatusTypes) => void;
  };

/**
 *
 */
export const director = (deps: DirectorDeps) => {
  deps.finally(() => poolProv.shutdown()); //trick to register onShutdown, before it has been defined.

  //compile service

  const makeJacsBee = deps.makeMakeJacsWorkerBee(deps);

  //pool and autostart scripts.

  const actionProv = new ClientComController(deps);

  const poolProv = new ScriptPoolController({
    scripts: deps.scripts,
    makeTsBee: makeJacsBee,

    onError: deps.onError,
    finally: deps.finally,
    logProv: deps.logProv,

    ...actionProv,
    onStatusChange: deps.onStatusChange || (() => {}),
    onControlMessage: () => {},
    sendProcessStatus: () => {},
  });

  return poolProv; //for testing
};

export type ClientComDeps = {
  scripts: ScriptDefinition[];
  indexPrefix: boolean;
} & Pick<LogProv, "logStream">;

/**
 *
 */
export class ClientComController {
  constructor(private deps: ClientComDeps) {}

  /**
   *
   */
  public onScriptOutput = (script: string, output: ScriptOutput) => {
    let prefix: string;

    if (this.deps.indexPrefix) {
      prefix = "" + this.deps.scripts.findIndex((elm) => elm.script === script);
    } else {
      prefix = basename(script);
    }

    switch (output.type) {
      case "stdout":
      case "stderr":
        this.deps.logStream(prefix, output.data);
        break;

      case "message": {
        switch (output.data.type) {
          case "html":
            throw new Error("Not supported");

          case "log":
            this.deps.logStream(
              output.data.logName ? prefix + " " + output.data.logName : prefix,
              capturedArrayEntriesTos(output.data.data)
            );
            break;

          case "error": {
            this.deps.logStream(prefix, (output.data.data.msg) + "\n"); // prettier-ignore

            if (output.data.data.info.length > 0) {
              this.deps.logStream(prefix, capturedArrayEntriesTos(output.data.data.info) + "\n"); // prettier-ignore
            }

            const e = parseTrace(output.data.data.stack);

            const indent = e.reduce<number>(
              (acc, cur) => Math.max(acc, cur.func?.length || 0),
              0
            );

            e.forEach((frame) => {
              this.deps.logStream(prefix, (frame.func || "ano").padEnd(indent, " ") + " " +  frame.file + " " + frame.line + "\n"); // prettier-ignore
            });

            break;
          }

          default:
            throw new Error("not impl");
        }

        break;
      }
      default:
        throw new Error("not impl");
    }
  };
}

/**
 * todo read from config file.
 */
export const getConf = (cliOptions: CliOptions): FullTsReloadConf => {
  return {
    cacheNodeResolve: cliOptions.cacheResolve,
    lazyRequire: cliOptions.lazy,
    enableLongTraces: cliOptions.longTraces,
    module: "commonjs",
    indexPrefix: cliOptions.indexPrefix,

    scripts: cliOptions.files.map(
      (script): ScriptDefinition => ({
        script: path.join(process.cwd(), script),
        autoStart: true,
        autoRestart: true,
      })
    ),
  };
};

/**
 *
 */
export const realMain = (mainProv: MainProv, cliOptions: CliOptions) => {
  //conf

  const conf = getConf(cliOptions);

  //start

  director({ ...conf, ...mainProv, makeMakeJacsWorkerBee });
};

/**
 *
 */
export const main = (cliOptions: CliOptions) => {
  mainWrapper(
    "",
    (mainProv) => realMain(mainProv, cliOptions),
    "console",
    true
  );
};

//duplicated
export const filterErrorMessage = (msg: string) => msg.replace(/^Error: /, "");

/**
 *
 */
export const parseTrace = (stack: CapturedStack): ParsedStackFrame[] => {
  if (stack.stack === undefined || stack.stack === "") {
    //error-stack-parser can't handle this case
    return [];
  }

  switch (stack.type) {
    case "node":
      return parseNodeTrace(stack.stack);

    case "parsed":
      return stack.stack;

    case "other":
      throw err("Unexpected stack trace in node environment", stack);

    default:
      return assertNever(stack);
  }
};
