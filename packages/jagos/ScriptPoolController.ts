import crypto from "crypto";
import { Bee, BeeListeners, MakeBee } from "^bee-common";
import { FinallyFunc } from "^finally-provider";

import { def, LogProv, unknownToErrorData, err } from "^jab";
import {
  TS_TIMEOUT,
  WatchableProcessPreloader,
  makePlainWorkerBee,
  getFileToRequire,
} from "^jab-node";
import { ScriptStatus, ScriptStatusTypes } from "^jagoc";
import { Waiter } from "^state-waiter";
import { paralleling } from "^yapu";

import { ActionProv } from "./ActionProvider";
import { loadScriptFolders, ScriptDefinition } from "./util";

const DO_PRELOAD_FOR_ACTIVE_SCRIPTS = true;

//quick fix: guard against client problems.
const MAX_PROC_COUNT = 1000;
let procCount = 0;

export type ScriptPoolProv = {
  updateScripts: () => void;
  getScriptStatus: () => ScriptStatus[];
  restartAllScripts: () => void;
  ensureAllScriptsStopped: () => Promise<void>;
  ensureScriptStopped: (script: string) => void;
  restartScript: (script: string) => void;
  shutdown: () => Promise<void>;
};

export type Deps = {
  scriptFolders?: string[];
  scripts?: ScriptDefinition[];
  makeTsBee: MakeBee;
  alwaysTypeScript?: boolean; //default false.

  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;

  //for testing
  scriptsDefs?: ScriptDefinition[];
  onStatusChange?: (script: string, status: ScriptStatusTypes) => void;
} & Pick<
  ActionProv,
  "sendProcessStatus" | "onControlMessage" | "onScriptOutput"
>;

type ScriptState = {
  script: string;
  autoRestart?: boolean;
  preload?: WatchableProcessPreloader<any, any>;
  process?: Bee<any>;
  dynamicallyLoaded: boolean; //whether it's loaded based on being in a script folder.
};

type ScriptStatusExtra = ScriptStatus & {
  dynamicallyLoaded: boolean; //whether it's loaded based on being in a script folder.
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
 *
 * todo
 *  there's no need for both `this.state` and `this.status`, they should just be merged.
 */
export class ScriptPoolController implements ScriptPoolProv {
  private state: Map<string, ScriptState> = new Map();
  private status: ScriptStatusExtra[] = [];

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
    loadScriptFolders(this.deps.scriptFolders).forEach(this.addScript(true));

    this.deps.scripts?.forEach(this.addScript(false));

    this.deps.scriptsDefs?.forEach(this.addScript(false));
  };

  /**
   *
   */
  private addScript =
    (dynamicallyLoaded: boolean) => (def: ScriptDefinition) => {
      //status

      this.status.push({
        id: crypto.createHash("md5").update(def.script).digest("hex"),
        script: def.script,
        status: "stopped",
        dynamicallyLoaded,
      });

      //state

      this.state.set(def.script, {
        ...def,
        dynamicallyLoaded,
      });

      //auto start

      if (def.autoStart) {
        //depends on state being set.
        this.restartScript(def.script);
      }
    };

  /**
   * Read scriptFolders again to find new script, and deleted scripts.
   *
   * - Preserve script status, that are non-stopped.
   * - Script state doesn't need to be pruned. It can linger. Actually, not really.
   * - Scripts definitions in `deps.scripts` will just stay the same.
   *
   * impl
   *  1. Find dynamically loaded scripts that is still running.
   *  2. Remove all dynamically loaded scripts from `status`
   *  3. Load new scritps and add them one by one.
   *      - Use old status, if any.
   *      - Keep track of running scritps, that are readded, because they still exist.
   *  4. Add all running scripts, that was deleted.
   */
  public updateScripts = () => {
    const nonStopped = this.status.filter(
      (def) => def.dynamicallyLoaded && def.status !== "stopped"
    );

    this.status = this.status.filter((def) => !def.dynamicallyLoaded);

    //load

    const defs = loadScriptFolders(this.deps.scriptFolders);

    defs.forEach((def) => {
      const oldIndex = nonStopped.findIndex((x) => x.script === def.script);

      let old: any = undefined;

      if (oldIndex !== -1) {
        old = nonStopped[oldIndex];

        nonStopped[oldIndex].script = "script-readded";
      }

      //status

      this.status.push({
        id: crypto.createHash("md5").update(def.script).digest("hex"),
        script: def.script,
        status: old?.status || "stopped",
        dynamicallyLoaded: true,
      });

      //create states for new scripts.

      const oldState = this.state.get(def.script);

      if (oldState === undefined) {
        this.state.set(def.script, { ...def, dynamicallyLoaded: true });
      }
    });

    for (const def of nonStopped) {
      if (def.script !== "script-readded") {
        this.status.push(def);
      }
    }
  };

  /**
   *
   */
  public getScriptStatus = (): ScriptStatus[] =>
    this.status.map((elm) => ({
      id: elm.id,
      script: elm.script,
      status: elm.status,
    }));

  /**
   *
   */
  public onStatusChange = (script: string, status: ScriptStatusTypes) => {
    const index = this.status.findIndex((x) => x.script === script);

    if (index === -1) {
      throw err("script not found in state: ", script);
    }

    this.status[index].status = status;

    //just send all of it.

    this.deps.sendProcessStatus(this.getScriptStatus());

    //for testing, because all that information is too much

    this.deps.onStatusChange && this.deps.onStatusChange(script, status);
  };

  /**
   * No need to stop all scripts. restartScript() will do that.
   *
   * resolves when preloader have sent startScript event to all processes.
   */
  public restartAllScripts = () =>
    paralleling(
      Array.from(this.state.values()),
      (state) => this.restartScript(state.script),
      this.deps.onError
    );

  /**
   * This is not a shutdown! Preloader will remain active.
   */
  public ensureAllScriptsStopped = () =>
    paralleling(
      Array.from(this.state.values()),
      (state) => this.ensureScriptStoppedByState(state),
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

    const state = this.state.get(script);

    if (state === undefined) {
      return Promise.reject(new Error("Script not found: " + script));
    }

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

        //it seems to noisy to emit this message
        // this.deps.onControlMessage(state.script, "Had to kill script.");

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
      this.deps.alwaysTypeScript || script.endsWith(".ts")
        ? this.deps.makeTsBee
        : makePlainWorkerBee;

    //custom main

    const customBooter = getFileToRequire(__dirname, "ScriptWrapperMain");

    //create

    return new WatchableProcessPreloader({
      customBooter,
      filename: script,
      onRestartNeeded: () => {
        if (autoRestart) {
          this.restartScript(script);
        }
      },
      onScriptRequired: () => {
        this.onStatusChange(script, "listening");
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
        this.onStatusChange(script, "stopped");
      },
    };

    if (!state.preload) {
      state.preload = this.makePreloader(state);
    }

    this.onStatusChange(script, "preloading");

    return state.preload.useProcess(procConf).then((process) => {
      this.onStatusChange(script, "running");

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
