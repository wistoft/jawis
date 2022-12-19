import { assert, err } from "^jab";
import { looping } from "^yapu";

/**
 *
 */
export type FinallyProv = {
  finally: FinallyFunc;
  runFinally: () => Promise<void>;
};

export type FinallyFunc = (
  func: () => void | undefined | Promise<void>
) => void;

/**
 *
 */
export type FinallyProviderDeps = {
  onError: (error: unknown, extraInfo?: Array<unknown>) => void;
};

/**
 * Register finally functions, and run them all before shutdown.
 */
export class FinallyProvider implements FinallyProv {
  private finallyFuncs: Array<() => void | undefined | Promise<void>> = [];
  private active = true;

  constructor(private deps: FinallyProviderDeps) {}

  /**
   *
   */
  public isActive = () => this.active;

  /**
   * Register a function to run before shutdown.
   */
  public finally = (func: () => void | undefined | Promise<void>) => {
    if (!this.active) {
      err("Finally functions have already been started.");
    }

    this.finallyFuncs.push(func);
  };

  /**
   * Run all the registered functions serially.
   */
  public runFinally = () => {
    assert(this.active, "Has already run finally functions.");

    this.active = false;

    return looping(this.finallyFuncs, (finalTasks) =>
      Promise.resolve() //
        .then(() => finalTasks())
        .catch((error: unknown) => {
          this.deps.onError(error, ["Finally threw."]);
        })
    );
  };
}
