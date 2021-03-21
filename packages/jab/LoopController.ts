import { assertNever, def, getPromise, PromiseTriple, Waiter } from ".";

// deps

export type LoopControllerDeps<T> = {
  arr: T[];
  makePromise: (elm: T) => Promise<unknown>;
  autoStart?: boolean;
  onError: (error: unknown) => void;
};

type States =
  | "unstarted"
  | "running"
  | "pausing"
  | "pausing-resuming"
  | "paused"
  | "done";

type Events = "iteration-done" | "resume";

/**
 * Controls serial execution of promises made from elements of an array.
 *
 * This means that given an array, and a function that makes a promise for each element in the array.
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
 *  - Resume event will not be emitted, when resume is called in unstarted-state. Also not if a pause 'cancels' the resume operation.
 */
export class LoopController<T> {
  public waiter: Waiter<States, Events>;

  private curIdx?: number;

  private loopProm!: PromiseTriple<void>;
  private pauseProm?: PromiseTriple<"paused" | "cancelled">;

  /**
   *
   */
  constructor(private deps: LoopControllerDeps<T>) {
    this.waiter = new Waiter<States, Events>({
      onError: this.deps.onError,
      startState: "unstarted",
      endState: "done",
    });

    this.curIdx = -1;
    this.loopProm = getPromise<void>();

    if (deps.autoStart === undefined || deps.autoStart === true) {
      this.start();
    }
  }

  /**
   * Return the loop-promise.
   */
  public getPromise = () => {
    return this.loopProm.promise;
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
      case "unstarted":
        return Promise.resolve("paused");

      case "pausing-resuming":
      case "running":
        this.waiter.set("pausing");

        this.pauseProm = getPromise();
        return def(this.pauseProm).promise;

      case "paused":
      case "pausing":
        return def(this.pauseProm).promise;

      case "done":
        throw new Error("Not active");

      default:
        return assertNever(state);
    }
  };

  /**
   * Resume execution
   *
   * - It's okay to resume, when already running, it's a no-op.
   * - Resume resolves the pausing-promise with: "cancelled".
   * - If the loop isn't running at all, i.e. wasn't auto started, resume will simply start the loop, as `this.start` does.
   */
  public resume = () => {
    const state = this.waiter.getState();
    switch (state) {
      case "unstarted":
        this.start();
        return;

      case "pausing":
        def(this.pauseProm).resolve("cancelled");
        this.waiter.set("pausing-resuming");
        return;

      case "paused":
        this.waiter.set("running");
        this.tryRunNextTest();
        return;

      case "pausing-resuming":
      case "running":
        //nothing to do
        return;

      case "done":
        throw new Error("Not active");

      default:
        return assertNever(state);
    }
  };

  /**
   *
   */
  public start = () => {
    if (!this.waiter.is("unstarted")) {
      throw new Error("Already started.");
    }

    this.waiter.set("running");

    this.tryRunNextTest();
  };

  /**
   *
   */
  private tryRunNextTest = () => {
    if (this.curIdx === undefined) {
      throw new Error("curIdx should be set.");
    }

    if (this.curIdx + 1 < this.deps.arr.length) {
      this.curIdx++;

      this.deps
        .makePromise(this.deps.arr[this.curIdx])
        .then(this.onIterationDone, this.onIterationError);
    } else {
      //we're done
      this.waiter.set("done");
      this.loopProm.resolve();
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

      case "pausing-resuming":
      case "running":
        this.waiter.set("done");
        this.loopProm.reject(error as Error);
        return;

      case "unstarted":
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
      case "pausing-resuming":
        this.waiter.set("running");
        this.tryRunNextTest();

        this.waiter.event("resume");
        return;

      case "pausing":
        this.waiter.set("paused");
        def(this.pauseProm).resolve("paused");
        return;

      case "running":
        this.tryRunNextTest();
        return;

      case "unstarted":
      case "paused":
      case "done":
        throw new Error("Impossible: " + state);

      default:
        return assertNever(state);
    }
  };
}
