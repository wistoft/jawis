import { FinallyProv, FinallyFunc, assert, err } from "^jab";
import { looping, timeRace2 } from "^yapu";

export type { FinallyProv, FinallyFunc };

/**
 *
 */
export type FinallyProviderDeps = {
  onError: (error: unknown, extraInfo?: Array<unknown>) => void;
  timeout?: number;
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

    return looping(this.finallyFuncs, (finalFunc) =>
      timeRace2(
        Promise.resolve()
          .then(finalFunc)
          .catch((error: unknown) => {
            this.deps.onError(error, ["Finally threw."]);
          }),
        this.deps.onError,
        this.deps.timeout,
        "Finally function"
      )
    );
  };
}
