import { tryProp, prej, def } from "^jab";
import { getPromise, sleepingValue, safeRace } from "^yapu";

const TIMEOUT_ERROR_CODE = "JAB_WAITER_TIMEOUT";
const CANCEL_ERROR_CODE = "JAB_WAITER_CANCEL";

const HARD_TIMEOUT = 300;

type Deps<States> = {
  startState: States;
  stoppingState?: States;
  endState?: States;
  onError: (error: unknown) => void;

  hardTimeout?: number;
};

/**
 * Handle async states conveniently.
 *
 * - One can wait for state changes or events.
 * - Implements convention for async shutdown and kill. For async shutdown and kill there is a 'stopping state'.
 *
 * notes
 * - Waiting is meant for development testing. It's possible to test specific async execution paths, when
 *    a test case can 'inject' actions at specific state changes or events of the object under test.
 * - Only one thing can wait at a time. This is to reduce complexity. If more things wait there's no
 *    way to know what will execute first. The result is likely flaky test cases.
 * - this.eventTrace is useful the see what has happened with this waiter.
 *
 */
export class Waiter<States, Events = never> {
  /**
   * Is update with all the state changes and event emitted.
   */
  public eventTrace: (States | Events | "cancel" | "error" | "close")[] = [];

  private state: States;

  private waitError?: Error; // holds the error object with the current waiters own stack.

  private signal?: {
    type: States | Events;
    resolve: () => void;
    reject: (error: unknown) => void;
  };

  private neverSignal?: {
    type: States | Events;
    promise: Promise<void>;
    reject: (error: Error) => void;
  };

  private shutdownProm?: Promise<void>;

  private killProm?: Promise<void>;

  private hardTimeout: number;

  /**
   *
   */
  constructor(private deps: Deps<States>) {
    this.state = deps.startState;

    //use default timeout if given.

    this.hardTimeout = this.deps.hardTimeout ?? HARD_TIMEOUT;
  }

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
   * Determine if the error is a cancel-error thrown by this class.
   */
  public static isCancel = (error: Error) =>
    tryProp(error, "code") === CANCEL_ERROR_CODE;

  /**
   * Await the specified state or event.
   *
   * - Timeout after 300ms, if state or event didn't happen.
   */
  public await = (type: States | Events, hardTimeout = this.hardTimeout) => {
    if (this.state === this.deps.endState) {
      return Promise.reject(new Error("Can't await, when terminated."));
    }

    if (this.state === this.deps.stoppingState) {
      return Promise.reject(new Error("Can't await, when stopping."));
    }

    return this.rawAwait(type, hardTimeout);
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
    hardTimeout = this.hardTimeout
  ) => {
    this.waitError = new Error("Cancelled while waiting.");

    const signalPromise = new Promise<void>((resolve, reject) => {
      if (this.signal !== undefined) {
        reject(new Error("Signal already registered."));
      }

      //we can do it

      if (this.state === type) {
        //already there
        resolve();
      } else {
        this.signal = { type, resolve, reject };
      }
    });

    // no timeout

    if (hardTimeout <= 0) {
      return signalPromise;
    }

    //somewhat hacky, but the stack trace in the lambda below gives no relevant information. So why not?

    const betterError = new Error("Timeout waiting for: " + type);

    //mark the error, so users can known it's a timeout error.

    (betterError as any).code = TIMEOUT_ERROR_CODE;

    // setup timeout

    const symbol = Symbol("timeout");

    const timeoutPromise = sleepingValue(hardTimeout, symbol);

    return safeRace([signalPromise, timeoutPromise], this.deps.onError).then(
      (val) => {
        if (val === symbol) {
          //The signal timed out, so we cancel it completely, even though it might happen later.
          this.signal = undefined;

          throw betterError;
        } else {
          //happy path.
          return val;
        }
      }
    );
  };

  /**
   * Emit an event.
   */
  public event = (event: Events, data?: unknown) => {
    this.eventTrace.push(event);

    if (this.signal) {
      if (this.signal.type === event) {
        (this.signal.resolve as any)(data); //no sure data is a good idea. The waiter hack, shouldn't become too convenient???
        this.signal = undefined;
      }
    }

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

    if (this.signal) {
      if (this.signal.type === newState) {
        this.signal.resolve();
        this.signal = undefined;
      }
    }

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

    if (!this.waitError) {
      throw new Error("Impossible: waitError not set.");
    }

    //custom message

    if (msg) {
      this.waitError.message = msg;
    }

    //mark

    (this.waitError as any).code = CANCEL_ERROR_CODE;

    //reject the wait.

    this.onErrorOld(this.waitError); // internal onError, to reject the waiter.
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

  public onErrorOld = (error: unknown) => {
    this.eventTrace.push("error");

    if (this.signal) {
      this.signal.reject(error);
      this.signal = undefined;
    }
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
      this.signal.reject(error);
      this.signal = undefined;
    } else {
      this.deps.onError(error);
    }
  };

  /**
   * Use this a close-callback in the object under state control.
   *
   * - If there is someone waiting anything other than close, it will be rejected.
   */
  public onClose = () => {
    this.eventTrace.push("close");

    if (this.deps.endState === undefined) {
      throw new Error("Can't call onClose on a waiter without endState");
    }

    this.state = this.deps.endState;

    if (this.signal) {
      if (this.signal.type === this.deps.endState) {
        this.signal.resolve();
        this.signal = undefined;
      } else {
        this.signal.reject(
          new Error("Terminated while waiting for: " + this.signal.type)
        );
        this.signal = undefined;
      }
    }
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
    if (this.state === this.deps.stoppingState) {
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

      if (res instanceof Promise) {
        if (!this.deps.stoppingState) {
          return prej(
            "There has to be a stoppingState, when " + type + " is async."
          );
        }

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
