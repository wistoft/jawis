import crypto from "node:crypto";

import {
  def,
  LogProv,
  unknownToErrorData,
  assert,
  AbsoluteFile,
  GetAbsoluteSourceFile,
  LogEntry,
} from "^jab";
import { WatchableProcessPreloader } from "^process-util";
import { getAbsoluteSourceFile_live } from "^jab-node";
import {
  Bee,
  BeeDeps,
  BeePreloaderProv,
  NoopBeePreloader,
  HoneyComb,
} from "^bee-common";
import { paralleling, timeRace } from "^yapu";
import { FinallyFunc } from "^finally-provider";
import { Waiter } from "^state-waiter";

import {
  ScriptDefinition,
  ScriptStatus,
  ScriptStatusTypes,
  loadScriptFolders,
  scriptWrapperMainDeclaration,
} from "./internal";

export type ScriptPoolProv = {
  updateScripts: () => void;
  getScriptStatus: () => ScriptStatus[];
  restartBee: (filename: string, data?: unknown) => void;
  stopScript: (script: string) => void;
  killScript: (script: string) => void;
  restartAllScripts: () => void;
  stopAllScripts: () => Promise<void>;
  shutdown: () => Promise<void>;
};

export type ScriptPoolControllerDeps = {
  scriptFolders: string[];
  scripts: ScriptDefinition[];
  honeyComb: HoneyComb<"ts">;
  showTime: boolean;
  preloadActiveScripts?: boolean;
  getAbsoluteSourceFile?: GetAbsoluteSourceFile;

  onStatusChange: (script: string, status: ScriptStatusTypes) => void;
  onScriptLog: (script: string, entry: LogEntry) => void;
  onScriptMessage: (script: string, msg: any) => void;

  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;
};

//timeout to wait for scripts when shutting down pool. They will be killed if timeout expires.
//zero indicates, that the scripts should be killed.
const PoolShutdownTimeout = 5000;

type ScriptState = {
  script: AbsoluteFile;
  autoRestart?: boolean;
  preload?: BeePreloaderProv<any, any>;
  process?: Bee<any>;
  dynamicallyLoaded: boolean; //whether it's loaded based on being in a script folder.
  startTimeMillis?: number;
} & ScriptStatus;

type States = "ready" | "stopping" | "stopped";

/**
 * todo
 *  - bug: need to be protected against events while async work hasn't finished
 *
 * Manages both processes/worker threads.
 *
 * - Manages a fixed set of scripts (JavaScript or TypeScript).
 * - Scripts ending with '.ts' will have TypeScript support.
 * - The script will only have one process open. When a process is starting, the
 *     old process is always shutdown first.
 * - Preloads processes. For minimizing compile startup-delay.
 *
 */
export class ScriptPoolController implements ScriptPoolProv {
  private stateCollection: Map<string, ScriptState> = new Map();

  private waiter: Waiter<States, never>;
  private preloadActiveScripts: boolean;

  constructor(private deps: ScriptPoolControllerDeps) {
    this.deps.finally(() => this.noisyKill()); //must be before the processes, because we want to shutdown, before them.

    this.preloadActiveScripts = this.deps.preloadActiveScripts ?? true;

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
    loadScriptFolders(this.deps.honeyComb, this.deps.scriptFolders).forEach(
      this.addScript(true)
    );

    this.deps.scripts?.forEach(this.addScript(false));
  };

  /**
   *
   */
  private addScript =
    (dynamicallyLoaded: boolean) => (def: ScriptDefinition) => {
      this.stateCollection.set(def.script, {
        ...def,
        id: crypto.createHash("md5").update(def.script).digest("hex"),
        status: "stopped",
        dynamicallyLoaded,
      });

      //auto start

      if (def.autoStart) {
        //depends on state being set.
        this.restartBee(def.script);
      }
    };

  /**
   * Read scriptFolders again to find new and deleted scripts.
   *
   * - Preserve state for non-stopped scripts.
   * - Script definitions in `deps.scripts` will just stay the same.
   */
  public updateScripts = () => {
    //clone

    const oldStates = new Map(this.stateCollection);

    //load

    const defs = loadScriptFolders(
      this.deps.honeyComb,
      this.deps.scriptFolders
    );

    //create new state collection

    this.stateCollection = new Map();

    defs.forEach((def) => {
      //reuse old states

      const oldState = oldStates.get(def.script);

      oldStates.delete(def.script);

      //update/create state

      this.stateCollection.set(def.script, {
        status: "stopped",
        script: def.script,
        id: crypto.createHash("md5").update(def.script).digest("hex"),
        ...oldState,
        dynamicallyLoaded: true,
      });
    });

    //prune states

    oldStates.forEach((state, key) => {
      if (state.dynamicallyLoaded && state.status === "stopped") {
        this.killPreloader(state); //clean up garbage
      } else {
        this.stateCollection.set(key, state); //re-add scripts, that aren't dynamic.
      }
    });
  };

  /**
   *
   */
  public getScriptStatus = (): ScriptStatus[] =>
    Array.from(this.stateCollection.values()).map((state) => ({
      id: state.id,
      script: state.script,
      status: state.status,
      time: state.time,
    }));

  /**
   * only used in tests
   */
  public getSingleScriptStatus = (script: string) => {
    for (const state of this.stateCollection.values()) {
      if (state.script === script) {
        return state.status;
      }
    }

    throw new Error("Script not found: " + script);
  };

  /**
   *
   */
  public restartBee = (filename: string, data?: unknown) => {
    const state = this.stateCollection.get(filename);

    if (state === undefined) {
      return Promise.reject(new Error("Script not found: " + filename));
    }

    return this.killJustBeeByState(state).then(() =>
      this.startBee(state, data)
    );
  };

  /**
   *
   */
  public stopScript = (script: string) => {
    const state = def(this.stateCollection.get(script));
    return this.stopJustBeeByState_new(state);
  };

  /**
   *
   */
  public killScript = (script: string) => {
    const state = def(this.stateCollection.get(script));
    return this.killJustBeeByState(state);
  };

  /**
   * No need to stop all scripts. restartScript() will do that.
   *
   * resolves when preloader has sent startScript event to all processes.
   */
  public restartAllScripts = () =>
    paralleling(
      Array.from(this.stateCollection.values()),
      (state) => this.restartBee(state.script),
      this.deps.onError
    );

  /**
   * This is not a shutdown. Preloader will remain active.
   */
  public stopAllScripts = () =>
    paralleling(
      Array.from(this.stateCollection.values()),
      (state) => this.stopJustBeeByState_new(state),
      this.deps.onError
    ).then(() => {}); //just for typing

  /**
   *
   */
  private stopJustBeeByState_new = (state: ScriptState) => {
    if (!state.process) {
      //no entry, so not running
      return Promise.resolve();
    }

    return state.process.shutdown().catch((error: any) => {
      if (error.message === "Cancelled by kill.") {
        return;
      }

      throw error;
    });
  };

  /**
   *
   */
  private killJustBeeByState = (state: ScriptState) => {
    if (!state.process) {
      //no entry, so not running
      return Promise.resolve();
    }

    return state.process.kill();
  };

  /**
   *
   */
  public kill = () => this.waiter.shutdown(this.killAll); //burde dette ikke være this.waiter.kill

  public noisyKill = () => this.waiter.noisyKill(this.killAll, "pool");

  private killAll = () => this.finalizeHelper(this.killByState);

  public shutdown = () =>
    this.waiter.shutdown(() => this.finalizeHelper(this.shutdownByState));

  /**
   *
   */
  private finalizeHelper = (finalizer: (state: ScriptState) => Promise<void>) =>
    paralleling(
      Array.from(this.stateCollection.values()),
      finalizer,
      this.deps.onError
    ).then(this.checkIfStopped); //if there's no process alive, it won't be called by onExit-callback.

  /**
   *
   */
  private killByState = async (state: ScriptState) => {
    await state.process?.kill();
    await this.killPreloader(state);
  };

  /**
   * Kills if the script doesn't stop when told to.
   *  But that isn't quite like the bee-interface specifies.
   *
   */
  private shutdownByState = async (state: ScriptState) => {
    if (state.process) {
      await timeRace(
        state.process.shutdown(),
        (prom) => prom.catch(() => {}) /* squash errors if timed out */,
        PoolShutdownTimeout
      ).catch(state.process.kill); //kill not matter which error. Incl. timeout.
    }

    await this.killPreloader(state);
  };

  /**
   *
   */
  private killPreloader = async (state: ScriptState) => {
    if (state.preload) {
      return state.preload.kill();
    }
  };

  /**
   *
   */
  private makePreloader = ({
    script,
    autoRestart,
  }: ScriptDefinition): BeePreloaderProv<any, any> => {
    //new stuff

    if (this.deps.honeyComb?.isBee(script)) {
      return new NoopBeePreloader({
        makeBee: this.deps.honeyComb.makeBee,
        finally: this.deps.finally,
      });
    }

    // old non-honey comb stuff

    const getAbsoluteSourceFile = this.deps.getAbsoluteSourceFile ?? getAbsoluteSourceFile_live; // prettier-ignore

    //custom main

    const customBooter = getAbsoluteSourceFile(scriptWrapperMainDeclaration);

    //create

    return new WatchableProcessPreloader({
      customBooter,
      onRestartNeeded: () => {
        if (autoRestart) {
          this.restartBee(script);
        }
      },
      onScriptRequired: () => {
        this.onStatusChange(script, "listening");
      },

      makeBee: this.deps.honeyComb.makeMakeCertainBee("ts"),

      onError: this.deps.onError,
      finally: this.deps.finally,

      //could these two be combined?
      logProv: this.deps.logProv,
      onLog: (args) => this.deps.onScriptLog(script, args),
    });
  };

  /**
   *
   */
  private checkIfStopped = () => {
    if (this.waiter.is("stopping")) {
      let allStopped = true;

      this.stateCollection.forEach((state) => {
        if (state.process && !state.process.is("stopped")) {
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
  private onStatusChange = (script: string, status: ScriptStatusTypes) => {
    //update state

    const oldState = this.stateCollection.get(script);

    if (!oldState) {
      console.log("script not found in state: ", script);
    } else {
      oldState.status = status;

      if (status === "stopped" && this.deps.showTime) {
        const tmp = Math.floor(Date.now() - def(oldState.startTimeMillis));

        oldState.time = tmp / 1000;
      }
    }

    //for testing, because all that information is too much

    this.deps.onStatusChange && this.deps.onStatusChange(script, status);
  };

  /**
   *
   */
  private startBee = (state: ScriptState, data: unknown): Promise<void> => {
    const { script } = state;

    const onLog = (args: LogEntry) => this.deps.onScriptLog(script, args);

    //could extract turning bee output into a single message type. But not needed anywhere else.
    // execBee does something similar
    const beeDeps: BeeDeps<unknown> = {
      def: {
        filename: script,
        data,
      },
      onLog,
      onMessage: (msg) => this.deps.onScriptMessage(script, msg),
      onStdout: (data) => {
        onLog({
          type: "stream",
          logName: "stdout",
          data,
        });
      },
      onStderr: (data) => {
        onLog({
          type: "stream",
          logName: "stderr",
          data,
        });
      },
      onError: (error) => {
        onLog({
          type: "error",
          data: unknownToErrorData(error),
        });
      },
      onExit: () => {
        this.checkIfStopped();
        this.onStatusChange(script, "stopped");
      },
      finally: this.deps.finally,
    };

    if (!state.preload) {
      state.preload = this.makePreloader(state);
    }

    state.time = undefined;

    this.onStatusChange(script, "preloading");

    return state.preload.useBee(beeDeps).then((bee) => {
      this.onStatusChange(script, "running");

      assert(state.status === "running");

      //create new state

      this.stateCollection.set(script, {
        ...state,
        process: bee,

        time: undefined,
        startTimeMillis: Date.now(),

        //starts the preload for next time.
        preload: this.preloadActiveScripts
          ? this.makePreloader(state)
          : undefined,
      });
    });
  };
}
