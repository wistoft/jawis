import async_hooks from "async_hooks";

import {
  assertNever,
  basename,
  clonedArrayEntriesTos,
  enable,
  err,
  LogProv,
} from "^jab";
import { MainProv, mainWrapper, makeAbsolute } from "^jab-node";
import { CapturedStack, MakeBee, ParsedStackFrame, ScriptOutput } from "^jabc";
import { MakeMakeJacsBeeDeps, makeMakeJacsWorkerBee } from "^jacs";
import { ScriptStatus } from "^jagoc";
import { ScriptDefinition, ScriptPoolController } from "^jagos";
import { ClientComProv } from "^jagos/ClientComController";
import { parseNodeTrace } from "^util-javi";

export type CliOptions = {
  files: string[];
  config: string;
  cacheResolve: boolean;
  indexPrefix: boolean;
  lazy: boolean;
  longTraces: boolean;
};

export type FullTsDevConf = {
  scripts: ScriptDefinition[];
  cacheNodeResolve: boolean;
  lazyRequire: boolean;
  enableLongTraces: boolean;
  indexPrefix: boolean;

  //for testing
  alwaysTypeScript?: boolean;
};

export type DirectorDeps = MainProv &
  FullTsDevConf & {
    //for testing
    makeMakeJacsWorkerBee: (deps: MakeMakeJacsBeeDeps) => MakeBee;
    sendProcessStatus?: (status: ScriptStatus[]) => void;
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
    alwaysTypeScript: deps.alwaysTypeScript,

    onError: deps.onError,
    finally: deps.finally,
    logProv: deps.logProv,

    ...actionProv,
    sendProcessStatus: deps.sendProcessStatus || (() => {}),
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
export class ClientComController implements ClientComProv {
  constructor(private deps: ClientComDeps) {}

  /**
   * Not really possible to display this in the console.
   */
  public sendProcessStatus = () => {};

  /**
   * Doesn't send any information right now.
   */
  public onControlMessage = () => {};

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

      case "log": {
        switch (output.data.type) {
          case "html":
            throw new Error("Not supported");

          case "log":
            this.deps.logStream(
              output.data.logName ? prefix + " " + output.data.logName : prefix,
              clonedArrayEntriesTos(output.data.data)
            );
            break;

          case "error": {
            this.deps.logStream(prefix, filterErrorMessage(output.data.data.msg) + "\n"); // prettier-ignore

            if (output.data.data.info.length > 0) {
              this.deps.logStream(prefix, clonedArrayEntriesTos(output.data.data.info) + "\n"); // prettier-ignore
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
export const getConf = (cliOptions: CliOptions): FullTsDevConf => {
  return {
    cacheNodeResolve: cliOptions.cacheResolve,
    lazyRequire: cliOptions.lazy,
    enableLongTraces: cliOptions.longTraces,
    indexPrefix: cliOptions.indexPrefix,

    scripts: cliOptions.files.map(
      (script): ScriptDefinition => ({
        script: makeAbsolute(process.cwd(), script),
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

  //long traces

  if (conf.enableLongTraces) {
    enable(async_hooks);
  }

  //start

  director({ ...conf, ...mainProv, makeMakeJacsWorkerBee });
};

/**
 *
 */
export const main = (cliOptions: CliOptions) => {
  mainWrapper({
    main: (mainProv) => realMain(mainProv, cliOptions),
    type: "console",
    registerOnShutdown: true,
    enableLongTraces: false, //done within realMain, when conf is loaded.
    consoleGroupingDelay: 250, //how to extract this?
  });
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

    case "node-parsed":
      return stack.stack;

    case "other":
      throw err("Unexpected stack trace in node environment", stack);

    default:
      return assertNever(stack);
  }
};
