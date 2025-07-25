import filewatcher from "filewatcher";

import { def, GetAbsoluteSourceFile } from "^jab";
import {
  BeeListeners,
  BeePreloaderDeps,
  BeePreloader,
  BeePreloaderProv,
  BeeDeps,
} from "^bee-common";
import { getAbsoluteSourceFile_live } from "^jab-node";
import {
  watchableProcessMainDeclaration,
  RequireSenderMessage,
} from "./internal";

export type WatchableProcessPreloaderDeps = BeePreloaderDeps & {
  onRestartNeeded: () => void;
  onScriptRequired: () => void;
  getAbsoluteSourceFile?: GetAbsoluteSourceFile;
  filterRequireMessages?: boolean; //default true
  customBooter?: string;
};

/**
 * - Init a preloader with a "require sender."
 * - Init a watcher. For watching required files.
 * - Start the real script.
 *
 */
export class WatchableProcessPreloader<MR extends {}, MS extends {}>
  implements BeePreloaderProv<MR, MS>
{
  private preload: BeePreloader<any, any>;
  private fileChanged = false;
  private watcher: any;
  private depListeners?: BeeListeners<any>;
  private depFilterRequireMessages: boolean;

  /**
   *
   */
  constructor(private deps: WatchableProcessPreloaderDeps) {
    const getAbsoluteSourceFile = deps.getAbsoluteSourceFile ?? getAbsoluteSourceFile_live; // prettier-ignore

    const customBooter = this.deps.customBooter
      ? this.deps.customBooter
      : getAbsoluteSourceFile(watchableProcessMainDeclaration);

    this.preload = new BeePreloader<MR, MS>({
      ...deps,
      customBooter,
    });

    this.depFilterRequireMessages =
      deps.filterRequireMessages === undefined
        ? true
        : deps.filterRequireMessages;

    //watcher

    this.watcher = filewatcher();

    this.watcher.on("change", () => {
      this.watcher.removeAll();

      if (this.fileChanged) {
        //it doesn't seem to be necessary to guard against multiple events. Watching is removed fast enough.
        throw new Error("filewatcher didn't stop watching files fast enough.");
      }

      this.deps.onRestartNeeded();

      this.fileChanged = true;
    });

    this.watcher.on("fallback", () => {
      this.deps.onError(new Error("filewatcher fallback"));
    });
  }

  /**
   *
   */
  public useBee = (deps: BeeDeps<MR>) => {
    //so it can be called in this.onMessage.

    this.depListeners = deps;

    return this.preload.useBee({
      ...deps,
      onMessage: this.onMessage,
      onExit: this.onExit,
    });
  };

  /**
   *
   */
  private onExit = () => {
    //when the process closes itself.
    this.watcher.removeAll();

    def(this.depListeners).onExit();
  };

  /**
   *
   */
  private onMessage = (
    msg: RequireSenderMessage | { type: "script-required" }
  ) => {
    switch (msg.type) {
      case "require":
        this.watcher.add(msg.file);

        //forward
        if (!this.depFilterRequireMessages) {
          def(this.depListeners).onMessage(msg as any);
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

  public shutdown = () => this.preload.shutdown();

  public kill = () => this.preload.kill();

  public noisyKill = () => this.preload.noisyKill();
}
