import {
  paralleling,
  def,
  LogProv,
  FinallyFunc,
  Waiter,
  unknownToErrorData,
} from "^jab";

import {
  TS_TIMEOUT,
  WatchableProcessPreloader,
  Bee,
  makePlainWorkerBee,
  MakeBee,
  BeeListeners,
} from "^jab-node";

import { ActionProv } from "./ActionProvider";
import { ScriptDefinition } from "./util";

const DO_PRELOAD_FOR_ACTIVE_SCRIPTS = true;

//quick fix: guard against client problems.
const MAX_PROC_COUNT = 1000;
let procCount = 0;

export type ScriptPoolProv = {
  restartAllScripts: () => void;
  ensureAllScriptsStopped: () => Promise<void>;
  ensureScriptStopped: (script: string) => void;
  restartScript: (script: string) => void;
  shutdown: () => Promise<void>;
};

export type Deps = {
  logProv: LogProv;
  scriptsDefs: ScriptDefinition[];
  alwaysTypeScript?: boolean; //default false.
  makeTsBee: MakeBee;

  onError: (error: unknown) => void;
  finally: FinallyFunc;
} & Pick<
  ActionProv,
  "onProcessStatusChange" | "onControlMessage" | "onScriptOutput"
>;

type ScriptState = {
  script: string;
  autoRestart?: boolean;
  preload?: WatchableProcessPreloader<any, any>;
  process?: Bee<any>;
};

type States = "ready" | "stopping" | "stopped";

/**
 * Manages both processes/worker threads.
 *
 * - Manages a fixed set of scripts (JavaScript or TypeScript).
 * - Scripts ending with '.ts' will have TypeScript support.
 * - guarantees, that the script only has one process open. When a process is starting, the
 *     old process is always shutdown first.
 * - preloads processes. For minimizing compile startup-delay.
 *
 * bug: need to be protected against events while async work hasn't finished
 */
export class ScriptPoolController implements ScriptPoolProv {
  private state: Map<string, ScriptState> = new Map();

  private waiter: Waiter<States, never>;

  constructor(private deps: Deps) {
    this.deps.finally(() => this.noisyKill()); //must be before the processes, because we want to shutdown, before them.

    //init

    this.initScripts();

    this.waiter = new Waiter<States, never>({
      onError: deps.onError,
      startState: "ready",
      stoppingState: "stopping",
      endState: "stopped",
    });
  }

  /**
   *
   */
  private initScripts = () => {
    this.deps.scriptsDefs.forEach((def) => {
      //state

      this.state.set(def.script, {
        ...def,
        preload: undefined,
      });

      //auto start

      if (def.autoStart) {
        //depends on state being set.
        this.restartScript(def.script);
      }
    });
  };

  /**
   * No need to stop all scripts. restartScript() will do that.
   *
   * resolves when preloader have sent startScript event to all processes.
   */
  public restartAllScripts = () =>
    paralleling(
      this.deps.scriptsDefs,
      (def) => this.restartScript(def.script),
      this.deps.onError
    );

  /**
   * This is not a shutdown! Preloader will remain active.
   */
  public ensureAllScriptsStopped = () =>
    paralleling(
      Array.from(this.state.values()),
      (state) => Promise.resolve(state.process?.shutdown()),
      this.deps.onError
    ).then(() => {}); //just for typing

  /**
   *
   */
  public restartScript = (script: string) => {
    procCount++;
    if (procCount > MAX_PROC_COUNT) {
      this.deps.logProv.log("max proc count");

      return Promise.reject(new Error("max proc count."));
    }

    const state = def(this.state.get(script));

    return this.ensureScriptStoppedByState(state)
      .then(() => this.getStartedProcess(state))
      .then((newState) => {
        this.state.set(script, newState);
      })
      .catch(this.cancelSquash);
  };

  /**
   * used by socket handler.
   */
  public ensureScriptStopped = (script: string) => {
    const state = def(this.state.get(script));
    return this.ensureScriptStoppedByState(state);
  };

  /**
   * Kills if the script doesn't stop when told to.
   */
  private ensureScriptStoppedByState = (state: ScriptState) => {
    if (!state.process) {
      //no entry, so not running
      return Promise.resolve();
    }

    return state.process.shutdown().catch((error: Error) => {
      if (Waiter.isTimeout(error)) {
        //it's a timeout - so the process is killed.

        this.deps.onControlMessage(state.script, "Had to kill script.");

        return state.process?.kill();
      } else {
        //no a timeout - but should we kill anyway?
        throw error;
      }
    });
  };

  /**
   *
   */
  public shutdown = () => this.waiter.shutdown(this.shutdownAll);

  public noisyKill = () => this.waiter.noisyKill(this.killAll, "pool");

  private killAll = () => this.finalizeHelper(this.killByState);

  private shutdownAll = () => this.finalizeHelper(this.shutdownByState);

  /**
   *
   */
  private finalizeHelper = (finalizer: (state: ScriptState) => Promise<void>) =>
    paralleling(
      Array.from(this.state.values()),
      finalizer,
      this.deps.onError
    ).then(this.checkIfStopped); //if no processes are alive, it won't be called by onExit-callback.

  private killByState = (state: ScriptState) =>
    Promise.resolve()
      .then(() => state.process?.kill())
      .then(() => this.killPreloader(state));

  private shutdownByState = (state: ScriptState) =>
    Promise.resolve()
      .then(() => state.process?.shutdown())
      .then(() => this.killPreloader(state));

  private killPreloader = (state: ScriptState) =>
    Promise.resolve().then(() => {
      if (state.preload) {
        state.preload.cancel();

        return state.preload.kill();
      }
    });

  /**
   *
   */
  private makePreloader = ({ script, autoRestart }: ScriptDefinition) => {
    // depends on script, not preloader, so default `makeTsProcessConditonally` can't be used.

    const makeTsBeeConditonally =
      this.deps.alwaysTypeScript ||
      script.endsWith(".ts") ||
      script.endsWith(".tsx")
        ? this.deps.makeTsBee
        : makePlainWorkerBee;

    //create

    return new WatchableProcessPreloader({
      filename: script,
      onRestartNeeded: () => {
        if (autoRestart) {
          this.restartScript(script);
        }
      },
      onScriptRequired: () => {
        this.deps.onProcessStatusChange(script, "listening");
      },

      timeout: 2 * TS_TIMEOUT, //for jacs compiler.

      makeBee: makeTsBeeConditonally,

      onError: this.deps.onError,
      finally: this.deps.finally,
      logProv: this.deps.logProv,
    });
  };

  /**
   *
   */
  private checkIfStopped = () => {
    if (this.waiter.is("stopping")) {
      let allStopped = true;
      this.state.forEach((state) => {
        if (state.process && !state.process.waiter.is("stopped")) {
          allStopped = false;
        }
      });

      if (allStopped) {
        this.waiter.set("stopped");
      }
    }
  };

  /**
   *
   */
  private getStartedProcess = (state: ScriptState): Promise<ScriptState> => {
    const { script } = state;

    const procConf: BeeListeners<any> = {
      onMessage: (msg: unknown) => {
        //the view will handle, if the message wasn't a jago log entry.
        this.deps.onScriptOutput(script, { type: "message", data: msg as any });
      },
      onStdout: (data: Buffer) => {
        this.deps.onScriptOutput(script, {
          type: "stdout",
          data: data.toString(),
        });
      },
      onStderr: (data: Buffer) => {
        this.deps.onScriptOutput(script, {
          type: "stderr",
          data: data.toString(),
        });
      },
      onError: (error: unknown) => {
        //we use jago message convention.
        this.deps.onScriptOutput(script, {
          type: "message",
          data: {
            type: "error",
            data: unknownToErrorData(error),
          },
        });
      },
      onExit: () => {
        this.checkIfStopped();
        this.deps.onProcessStatusChange(script, "stopped");
      },
    };

    if (!state.preload) {
      state.preload = this.makePreloader(state);
    }

    this.deps.onProcessStatusChange(script, "preloading");

    return state.preload.useProcess(procConf).then((process) => {
      this.deps.onProcessStatusChange(script, "running");

      return {
        ...state,
        process,

        //starts the preload for next time.
        preload: DO_PRELOAD_FOR_ACTIVE_SCRIPTS
          ? this.makePreloader(state)
          : undefined,
      };
    });
  };

  /**
   *
   */
  private cancelSquash = (error: Error) => {
    if (this.waiter.is("stopping") && Waiter.isCancel(error)) {
      return;
    }

    throw error; //everything else is re-thrown
  };
}
