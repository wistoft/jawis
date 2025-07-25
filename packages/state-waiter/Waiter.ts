import { tryProp, prej, def, assert } from "^jab";
import { getPromise, PromiseTriple } from "^yapu";

const TIMEOUT_ERROR_CODE = "JAB_WAITER_TIMEOUT";

const SOFT_TIMEOUT = 10000;
const HARD_TIMEOUT = 0;

export type WaiterDeps<States> = {
  startState: States;
  stoppingState?: States;
  endState?: States;
  onError: (error: unknown) => void;

  softTimeout?: number;
  hardTimeout?: number;

  //for testing
  DateNow?: () => number;
};

/**
 * Handle async states conveniently.
 *
 * - One can wait for state changes or events.
 * - Implements convention for async shutdown and kill. For async shutdown and kill there is a 'stopping state'.
 * - Default soft timeout for `await` is 10000
 * - No hard timeout by default.
 * - Timeout can be overwritten when contructing `Waiter`, or for each call to `await`.
 *
 * notes
 * - Waiting is meant for testing. It's possible to test specific async execution paths, when
 *    a test case can 'inject' actions at specific state changes or events of the object under test.
 * - Only one thing can wait at a time. This is to reduce complexity. If more things wait there's no
 *    way to know what will execute first. The result is likely flaky test cases.
 * - this.eventTrace is useful the see what has happened with the waiter.
 *
 *
 */
export class Waiter<States, Events = never> {
  /**
   * Is update with all the state changes and event emitted.
   */
  public eventTrace: (States | Events | "cancel" | "error" | "close")[] = [];

  private state: States;

  private signal?: {
    type: States | Events;
    startTime: number;
    waitError: Error; // holds the error object with the current waiter's own stack.
    didSoftTimeout?: true;
  } & PromiseTriple<void>;

  private neverSignal?: {
    type: States | Events;
  } & PromiseTriple<void>;

  private shutdownProm?: Promise<void>;

  private killProm?: Promise<void>;

  private softTimeout: number;
  private hardTimeout: number;

  private softTimeoutHandle?: any; //must be cleared, when a signal arrives.
  private hardTimeoutHandle?: any; //must be cleared, when a signal arrives.

  private DateNow: () => number;

  /**
   *
   */
  constructor(private deps: WaiterDeps<States>) {
    this.state = deps.startState;

    //use default timeouts if they are given.

    this.softTimeout = this.deps.softTimeout ?? SOFT_TIMEOUT;

    this.hardTimeout = this.deps.hardTimeout ?? HARD_TIMEOUT;

    //for testing

    this.DateNow = this.deps.DateNow ?? Date.now;
  }

  /**
   *
   */
  public getState = () => this.state;

  /**
   * Does anything wait.
   */
  public hasWaiter = () => this.signal !== undefined;

  /**
   * Is the waiter in specified state.
   */
  public is = (state: States) => this.state === state;

  /**
   * Determine if the error is a timeout-error thrown by this class.
   */
  public static isTimeout = (error: Error) =>
    tryProp(error, "code") === TIMEOUT_ERROR_CODE;

  /**
   * Await the specified state or event.
   *
   * - If state or event doesn't happen within specified time then timeout will happen. (soft and hard)
   */
  public await = (
    type: States | Events,
    hardTimeout = this.hardTimeout,
    softTimeout = this.softTimeout
  ) => {
    if (this.state === this.deps.endState) {
      return Promise.reject(new Error("Can't await, when terminated."));
    }

    if (this.state === this.deps.stoppingState) {
      return Promise.reject(new Error("Can't await, when stopping."));
    }

    return this.rawAwait(type, hardTimeout, softTimeout);
  };

  /**
   * Assert a state is never reached or event never emitted.
   */
  public never = (type: States | Events) => {
    if (this.neverSignal !== undefined) {
      return Promise.reject(new Error("Signal already registered."));
    }

    if (this.state === type) {
      return Promise.reject(new Error("Already in state: " + type));
    }

    this.neverSignal = { type, ...getPromise<void>() };

    return this.neverSignal.promise;
  };

  /**
   * To allow internal use of waiter in shutdown and kill.
   */
  private rawAwait = (
    type: States | Events,
    hardTimeout = this.hardTimeout,
    softTimeout = this.softTimeout
  ) => {
    if (this.signal !== undefined) {
      return Promise.reject(new Error("Signal already registered."));
    }

    if (this.state === type) {
      //already there
      return Promise.resolve();
    }

    //we can do it

    this.signal = {
      type,
      startTime: this.DateNow(),
      waitError: new Error("Cancelled while waiting."),
      ...getPromise<void>(),
    };

    // setup soft timeout

    if (softTimeout > 0) {
      this.softTimeoutHandle = setTimeout(() => {
        def(this.signal).didSoftTimeout = true;

        this.deps.onError(
          new Error(
            "Soft timeout waiting for: " + type + " (" + softTimeout + "ms)"
          )
        );
      }, softTimeout);
    }

    // setup hard timeout

    if (hardTimeout > 0) {
      this.hardTimeoutHandle = setTimeout(() => {
        assert(this.signal !== undefined);

        const error = new Error(
          "Timeout waiting for: " + type + " (" + hardTimeout + "ms)"
        );

        (error as any).code = TIMEOUT_ERROR_CODE; //mark the error, so users can know it's a timeout error.

        this.tryRejectSignal(error, false);
      }, hardTimeout);
    }

    // done

    return this.signal.promise;
  };

  /**
   * Resolve signal if it's registered for the given state.
   *
   */
  private tryResolveSignal = (
    state: States | Events | undefined,
    data?: any
  ) => {
    if (this.signal && this.signal.type === state) {
      this.maybeLateSettle();
      (this.signal.resolve as any)(data);
      this.signal = undefined;
      clearTimeout(this.softTimeoutHandle);
      clearTimeout(this.hardTimeoutHandle);
    }
  };

  /**
   *
   */
  private tryRejectSignal = (error: unknown, signalLateSettle = true) => {
    if (this.signal) {
      signalLateSettle && this.maybeLateSettle();
      this.signal.reject(error as any);
      this.signal = undefined;
      clearTimeout(this.softTimeoutHandle);
      clearTimeout(this.hardTimeoutHandle);
    }
  };

  /**
   * Prints an error, if the signal arrived after the soft timeout.
   */
  private maybeLateSettle = () => {
    if (this.signal === undefined) {
      throw new Error("Signal should be set");
    }

    if (this.signal.didSoftTimeout) {
      this.deps.onError(
        new Error(
          "Signal arrived after soft timeout, time: " +
            (this.DateNow() - this.signal.startTime)
        )
      );
    }
  };

  /**
   * Emit an event.
   */
  public event = (event: Events, data?: unknown) => {
    this.eventTrace.push(event);

    //not sure data is a good idea. The waiter hack, shouldn't become too convenient???
    this.tryResolveSignal(event, data);

    if (this.neverSignal) {
      if (this.neverSignal.type === event) {
        this.neverSignal.reject(new Error("Event happened: " + event));
      }
    }
  };

  /**
   * Set the state to a new value.
   *
   * - it's also possible to use onClose() for the close state.
   */
  public set = (newState: States) => {
    if (newState === this.deps.endState) {
      this.onClose();
      return;
    }

    this.eventTrace.push(newState);

    //for everything else

    this.state = newState;

    this.tryResolveSignal(newState);

    if (this.neverSignal) {
      if (this.neverSignal.type === newState) {
        this.neverSignal.reject(new Error("State was reached: " + newState));
      }
    }
  };

  /**
   * If there is a waiter, cancel it.
   *
   * - The waiter will be rejected. There's really nothing else to do, we can't resolve it.
   * - The waiters own stack is used.
   */
  public cancel = (msg?: string) => {
    if (!this.signal) return;

    this.eventTrace.push("cancel");

    //use the error created when await was registered.

    if (msg) {
      this.signal.waitError.message = msg; //custom message
    }

    //reject the wait.

    this.tryRejectSignal(this.signal.waitError); // internal onError, to reject the waiter.
  };

  /**
   * Expect cancel is not needed. I.e. nothing is waiting.
   *
   *  - If cancel is needed two errors are created.
   *  - This doesn't throw, it reports the error.
   */
  public noisyCancel = (msg?: string, msg2 = "Had to cancel wait.") => {
    if (!this.signal) return;

    this.cancel(msg);

    //report the current stack, but don't throw exception.

    const error = new Error(msg2);

    this.deps.onError(error); // external onError, because the cancel rejected the waiter.
  };

  /**
   * Use this as an error-callback in the object under state control.
   *
   * - Guarantees the error will occur somewhere.
   * - If there is a waiter it will be rejected with the error.
   * - If there is no waiter the error will be reported.
   */
  public onError = (error: unknown) => {
    this.eventTrace.push("error");

    if (this.signal) {
      this.tryRejectSignal(error);
    } else {
      this.deps.onError(error);
    }
  };

  /**
   * Use this as a close-callback in the object under state control.
   *
   * - If there is someone waiting for anything other than close, it will be rejected.
   */
  public onClose = () => {
    this.eventTrace.push("close");

    if (this.deps.endState === undefined) {
      throw new Error("Can't call onClose on a waiter without endState");
    }

    this.state = this.deps.endState;

    this.tryResolveSignal(this.deps.endState);

    this.tryRejectSignal( new Error("Terminated while waiting for: " + this.signal?.type) ); // prettier-ignore
  };

  /**
   * Perform a graceful shutdown.
   *
   * - The shutdown-callback implements the actual shutdown. Waiter knows nothing about what happens.
   * - The shutdown-callback will only be called once.
   * - Shutdown can be called multiple times, it will return the same promise.
   * - It's allowed to call shutdown, if kill has been called.
   * - see this.finalizer for more info.
   *
   */
  public shutdown = (
    shutdown: () => Promise<void> | unknown,
    autoEnd?: boolean
  ) => {
    if (this.shutdownProm) {
      return def(this.shutdownProm);
    }

    this.shutdownProm = this.finalizer({
      finalizer: shutdown,
      autoEnd,
      type: "shutdown",
    });

    return this.shutdownProm;
  };

  /**
   * Shutdown in the most efficient way. No grace at all.
   *
   * - see this.killReal for more info.
   */
  public kill = (kill: () => Promise<void> | unknown, autoEnd?: boolean) =>
    this.killReal({ kill, autoEnd });

  /**
   * Expect already in end state. I.e. has been shutdown or killed already.
   *
   *  - Report an error if not in end state. Then kill.
   */
  public noisyKill = (
    kill: () => Promise<void> | unknown,
    noisyName?: string,
    autoEnd?: boolean
  ) => this.killReal({ kill, autoEnd, noisyName });

  /**
   *  The purpose of kill is to stop even if `shutdown` couldn't do it graceful.
   *
   * - The kill-callback implements the actual kill. Waiter knows nothing about what happens.
   * - No matter what state (except endState): kill will cancel the waiter and perform kill again.
   *    It may be a killPromise or shutdownPromise, that's waiting. Kill doesn't care, it will perform kill again.
   * - see this.finalizer for more info.
   */
  public killReal = ({
    kill,
    autoEnd,
    noisyName,
  }: {
    kill: () => Promise<void> | unknown;
    autoEnd?: boolean;
    noisyName?: string;
  }) => {
    if (this.killProm) {
      return this.killProm;
    }

    this.killProm = this.finalizer({
      finalizer: kill,
      autoEnd,
      noisyName,
      type: "kill",
    });

    this.shutdownProm = this.killProm; //so subsequent shutdowns also can wait for the new promise.

    return this.killProm;
  };

  /**
   * Finalizer handles commonalities between shutdown and kill.
   *
   * - finalizer-callback is called sync. This makes things more predictable.
   * - Even though finalizer is called sync. If it throws, it will be turned into a rejection.
   * - State is changed to `stopping` after the finalizer-function is called.
   *    - The finalizer will access to the current state.
   *    - For kill that state might be `stopping` already, if kill or shutdown already have been called.
   *    - For shutdown the state will never be `stopping`, because it's called only once.
   * - A promise is returned both when finalizer return promise and something else.
   * - Noisy means: an error will be logged, if not already `stopped`. Used for noisy kill.
   * - `noisyName` can be empty string, and it will still be noisy.
   * - If something is waiting, it's considered an error. It will be cancelled, finalize will proceed.
   *
   * impl
   *  - this will call finalizer again always. shutdown and kill will have to make that logic themselfes.
   *  - what state should we go into, if finalizer throws?
   */
  private finalizer = ({
    finalizer,
    autoEnd = false,
    noisyName,
    type,
  }: {
    finalizer: () => Promise<void> | unknown;
    autoEnd?: boolean;
    noisyName?: string;
    type: "kill" | "shutdown";
  }) => {
    if (this.deps.endState === undefined) {
      throw new Error(
        "Can't call kill or shutdown on a waiter without endState."
      );
    }

    if (!autoEnd && !this.deps.stoppingState) {
      throw new Error("There has to be a stopping state, when autoEnd");
    }

    const state = this.getState();

    if (state === this.deps.endState) {
      return Promise.resolve();
    }

    if (noisyName !== undefined) {
      this.deps.onError(
        new Error("Had to " + type + " " + noisyName + " (state:" + state + ")")
      );
    }

    //only noisy cancel, if we haven't already sent an error.

    if (noisyName !== undefined) {
      //no need to repeat the same error twice.

      this.cancel("Cancelled by " + type + ".");
    } else {
      //we havn't been noisy before.

      this.noisyCancel("Cancelled by " + type + ".", type + " had to cancel.");
    }

    // `finalizer` is called sync. So we need try-catch.

    try {
      const res = finalizer();

      if (this.state === this.deps.endState) {
        //the finalizer could change the state, so maybe this should be more rigid
        return Promise.resolve();
      }

      if (res instanceof Promise) {
        if (!this.deps.stoppingState) {
          return prej(
            "There has to be a stoppingState, when " + type + " is async."
          );
        }
      }

      if (this.deps.stoppingState) {
        this.set(this.deps.stoppingState);
      }

      return Promise.resolve(res).then(() => {
        if (autoEnd) {
          //set end state
          this.set(def(this.deps.endState));
        } else {
          //in case a kill was started, before the shutdown-function finished.
          // we can't await end-state in that case, but we can await the killProm. That must be fine.
          if (type === "shutdown" && this.killProm !== undefined) {
            return this.killProm;
          }

          //wait for user to set end state.
          return this.rawAwait(def(this.deps.endState));
        }
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
