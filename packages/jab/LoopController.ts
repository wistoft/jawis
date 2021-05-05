import { assertNever, def, getPromise, PromiseTriple, Waiter } from ".";

// deps

export type LoopControllerDeps<T> = {
  initialArray: T[];
  makePromise: (elm: T) => Promise<unknown>;
  autoStart?: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onError: (error: unknown) => void;
};

type States = "running" | "pausing" | "paused" | "done";

type Events = "iteration-done";

/**
 * Controls serial execution of promises made from elements of an array.
 *
 * This means that given an array, and a function that makes a promise for each element in the array,
 *  LoopController ensures that it's possible to use the following operations:
 *    - pause
 *    - resume
 *
 * Terminology
 *  - loop-promise: Will resolve when all elements have be processes. See `this.getPromise`
 *  - pausing-promise: Will resolve when a pause operation succeeds. I.e. when the current iteration is done, and execution stops.
 *
 * Features
 *  - Pausing-promise can resolve with either "paused" or "cancelled".
 *      - It resolves with paused if the current iteration is finised before a new resume operation arrives
 *      - It resolves with cancelled if a resume operation arrives before the current iteration finishes.
 *  - If an iteration throws an error the execution will stop.
 *  - Both loop and pause promise will be rejected in case of error.
 *
 * impl
 *  - When pausing at last iteration, the state will become "paused", and the loop-promise will not resolve,
 *    until resume is called. Maybe that should change?
 */
export class LoopController<T> {
  public waiter: Waiter<States, Events>;

  private curIdx: number;
  private arr: T[];

  private loopProm!: PromiseTriple<void>;
  private pauseProm?: PromiseTriple<"paused" | "cancelled">;

  /**
   *
   */
  constructor(private deps: LoopControllerDeps<T>) {
    this.waiter = new Waiter<States, Events>({
      onError: this.deps.onError,
      startState: "paused",
    });

    this.curIdx = -1;
    this.arr = deps.initialArray;
    this.loopProm = getPromise<void>();

    if (deps.autoStart === undefined || deps.autoStart === true) {
      this.resume();
    }
  }

  /**
   *
   */
  public isRunning = () =>
    this.waiter.is("running") || this.waiter.is("pausing");

  /**
   * Return the loop-promise.
   *
   * note
   *  this is really compatible with: setArray and prependArray. Some semantic needs to be defined.
   */
  public getPromise = () => this.loopProm.promise;

  /**
   * Replace the underlying array.
   *
   * - Calling this, will not start execution. Simply call resume to do that.
   * - If executing, the new array will be used after the current iteration is done.
   * - A new loop promise is created, because the exsisting elements are dropped. Their loop will never resolve.
   */
  public setArray = (arr: T[]) => {
    this.curIdx = -1;
    this.arr = arr;

    //go into paused, so it's evident, that there's more elements, and a loop promise to think about.

    if (this.waiter.is("done")) {
      this.waiter.set("paused");
    }
  };

  /**
   * Prepend an array in front of the remaining elements.
   *
   * - The new array will be executed before the remaining elements from the old array.
   *    The then the old array will continue executed, as originally planed.
   */
  public prependArray = (arr: T[]) => {
    const remaining = this.arr.slice(this.curIdx + 1);
    this.arr = arr.concat(remaining);

    //set after remaining is calculated.

    this.curIdx = -1;

    //go into paused.

    if (this.waiter.is("done")) {
      this.waiter.set("paused");
    }
  };

  /**
   * Pause execution
   *
   * - It's okay to pause, when already pausing, it's a no-op.
   * - If already paused, a promise is returned, that resolve to "paused" next tick.
   * - A promise is returned, that resolves to "paused" when pause state is reached. Or "cancelled" in a resume operation
   *    cancels the pause before curren iteration is done.
   * - Pausing again will return the same promise as before, if pause state hasn't been reached since last pause operation.
   */
  public pause = (): Promise<"paused" | "cancelled"> => {
    const state = this.waiter.getState();

    switch (state) {
      case "paused":
      case "done":
        return Promise.resolve("paused");

      case "running":
        this.waiter.set("pausing");

        this.pauseProm = getPromise();
        return def(this.pauseProm).promise;

      case "pausing":
        return def(this.pauseProm).promise;

      default:
        return assertNever(state);
    }
  };

  /**
   * Resume execution
   *
   * - It's okay to resume, when already running, it's a no-op.
   * - Resume resolves the pausing-promise with: "cancelled".
   * - If the loop isn't running at all, i.e. wasn't auto-started, resume will simply start the loop.
   */
  public resume = () => {
    const state = this.waiter.getState();
    switch (state) {
      case "pausing":
        def(this.pauseProm).resolve("cancelled");
        this.waiter.set("running");
        return;

      case "paused":
        this.waiter.set("running");
        this.deps.onStart && this.deps.onStart();
        this.tryRunNextTest();
        return;

      case "done":
      case "running":
        //nothing to do
        return;

      default:
        return assertNever(state);
    }
  };

  /**
   *
   * important that
   *  - `this.arr` and `curIdx` is used in one tick only. Because it can change at any time.
   */
  private tryRunNextTest = () => {
    if (this.curIdx + 1 < this.arr.length) {
      this.curIdx++;

      this.deps
        .makePromise(this.arr[this.curIdx])
        .then(this.onIterationDone, this.onIterationError);
    } else {
      //we're done
      this.waiter.set("done");
      this.loopProm.resolve();

      this.deps.onStop && this.deps.onStop();
    }
  };

  /**
   *
   */
  private onIterationError = (error: unknown) => {
    const state = this.waiter.getState();
    switch (state) {
      case "pausing":
        def(this.pauseProm).reject(error as Error);

      //fall through

      case "running":
        this.waiter.set("done");

        this.loopProm.reject(error as Error);

        this.deps.onStop && this.deps.onStop();
        return;

      case "paused":
      case "done":
        throw new Error("Impossible");

      default:
        return assertNever(state);
    }
  };

  /**
   *
   */
  private onIterationDone = () => {
    this.waiter.event("iteration-done");

    const state = this.waiter.getState();
    switch (state) {
      case "pausing":
        this.waiter.set("paused");

        def(this.pauseProm).resolve("paused");

        this.deps.onStop && this.deps.onStop();
        return;

      case "running":
        this.tryRunNextTest();
        return;

      case "paused":
      case "done":
        throw new Error("Impossible: " + state);

      default:
        return assertNever(state);
    }
  };
}
