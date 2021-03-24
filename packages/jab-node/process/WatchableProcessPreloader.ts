import { Serializable } from "child_process";
import filewatcher from "filewatcher";

import { def } from "^jab";

import type { BeeListeners } from "..";

import {
  RequireSenderMessage,
  ProcessPreloaderDeps,
  ProcessPreloader,
  getFileToRequire,
} from ".";

export type WatchableProcessPreloaderDeps = ProcessPreloaderDeps & {
  onRestartNeeded: () => void;
  onScriptRequired: () => void;
  filterRequireMessages?: boolean;
};

/**
 * - Init a preloader with a "require sender."
 * - Init a watcher. For watching required files.
 * - Start the real script.
 */
export class WatchableProcessPreloader<
  MR extends Serializable,
  MS extends Serializable
> {
  private preload: ProcessPreloader<MS>;
  private fileChanged = false;
  private watcher: any;
  private depListeners?: BeeListeners<MR>;
  private depFilterRequireMessages: boolean;

  /**
   *
   */
  constructor(private deps: WatchableProcessPreloaderDeps) {
    const customBooter = getFileToRequire(__dirname, "WatchableProcessMain");

    this.preload = new ProcessPreloader<MS>({
      customBooter,
      ...deps,
    });

    this.depFilterRequireMessages =
      deps.filterRequireMessages === undefined
        ? true
        : deps.filterRequireMessages;

    //watcher

    this.watcher = filewatcher();

    this.watcher.on("change", () => {
      this.watcher.removeAll();

      if (!this.fileChanged) {
        //it doesn't seem to be necessary to guard against multiple events. Watching is removed fast enough.
        this.deps.onRestartNeeded();
      }

      this.fileChanged = true;
    });

    this.watcher.on("fallback", () => {
      this.deps.onError(new Error("filewatcher fallback"));
    });
  }

  /**
   *
   */
  public useProcess = (listeners: BeeListeners<MR>) => {
    //so it can be called in this.onMessage.

    this.depListeners = listeners;

    return this.preload.useProcess({
      ...listeners,
      onMessage: this.onMessage,
      onExit: this.onExit,
    });
  };

  /**
   *
   */
  private onExit = (exitcode: number | null) => {
    //when the process closes itself.
    this.watcher.removeAll();

    def(this.depListeners).onExit(exitcode);
  };

  /**
   *
   */
  private onMessage = (
    msg: MR & (RequireSenderMessage | { type: "script-required" })
  ) => {
    switch (msg.type) {
      case "require":
        this.watcher.add(msg.file);

        //forward
        if (!this.depFilterRequireMessages) {
          def(this.depListeners).onMessage(msg);
        }
        break;

      case "script-required":
        this.deps.onScriptRequired();
        break;

      default:
        //the message belongs to the user.

        def(this.depListeners).onMessage(msg);
    }
  };

  /**
   * No special handling needed here. Preloader will cancel the promise, and this will
   *  just do nothing.
   */
  public cancel = (msg?: string) => this.preload.cancel(msg);

  public shutdown = () => this.preload.shutdown();

  public kill = () => this.preload.kill();

  public noisyKill = () => this.preload.noisyKill();
}
