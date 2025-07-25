import { err, isBoolean, makeJabError, OnError } from "^jab";

export type PromiseTriple<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: Error) => void;
};

/**
 *
 */
export const sleeping = (ms: number) =>
  new Promise<unknown>((resolve) => setTimeout(resolve as () => void, ms));

/**
 * fix type to combine with sleeping().
 */
export const sleepingValue = <T>(ms: number, value: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

/**
 * reject after timeout.
 */
export const nightmare = (ms: number, msg = "You asked for nightmare") =>
  sleeping(ms).then(() => {
    throw err(msg);
  });

/**
 * Run some code without waiting for it to return.
 */
export const then = <V>(func: () => V | Promise<V>) =>
  Promise.resolve().then(func);

/**
 * Keep executing the promises, until false is returned.
 */
export const whiling = (makePromise: () => Promise<boolean>) =>
  new Promise<void>((resolve) => {
    const nextLoop = () =>
      makePromise().then((doContinue) => {
        if (doContinue) {
          nextLoop();
        } else {
          resolve();
        }
      });

    nextLoop();
  });

/**
 * Poll until true.
 */
export const poll = (
  func: () => boolean,
  interval = 100,
  timeout = 1000,
  timeoutMessage = "Poll timed out"
) => {
  const start = Date.now();
  const prom = getPromise<void>();

  const pollFunction = () => {
    //check for timeout

    if (Date.now() - start >= timeout) {
      prom.reject(new Error(timeoutMessage));
      return;
    }

    //poll the function

    if (func()) {
      prom.resolve();
    } else {
      setTimeout(pollFunction, interval);
    }
  };

  pollFunction();

  return prom.promise;
};

type PollResult<T> =
  | boolean
  | {
      done: false;
      value?: T;
    }
  | {
      done: true;
      value: T;
    };

type PollFinalResult<R extends PollResult<any>> = R extends boolean
  ? undefined
  : R extends {
        done: boolean;
        value: infer T;
      }
    ? T
    : never;

/**
 * Poll until done, and return the value
 *
 *  - The `func` param returning false is shortcut for returning { done: false }
 *  - The `func` param returning true is shortcut for returning { done: true, value: undefined }
 *      Except the overall return type will be void.
 *
 */
export const pollAsync = async <R extends PollResult<any>>(
  func: () => Promise<R>,
  interval = 100,
  timeout = 1000,
  timeoutMessage = "Poll timed out"
) => {
  const start = Date.now();
  const pollFunction = async (): Promise<PollFinalResult<R>> => {
    //check for timeout

    if (Date.now() - start >= timeout) {
      throw new Error(timeoutMessage);
    }

    //poll the function

    const _ret = await func();

    // compat

    let ret;

    if (isBoolean(_ret)) {
      ret = { done: _ret, value: undefined };
    } else {
      ret = _ret;
    }

    //are we done

    if (ret.done) {
      return ret.value as PollFinalResult<R>;
    } else {
      await sleeping(interval);

      return pollFunction();
    }
  };

  return pollFunction();
};

/**
 * Sequential execute promises over elements of an array.
 * Break/reject on first rejection.
 *
 * impl
 *  - There is no need to protect against throw in first `makePromise`, because the
 *      promise will reject, if the executor function throws.
 */
export const looping = <T>(
  arr: T[],
  makePromise: (elm: T) => Promise<unknown>
) =>
  new Promise<void>((resolve, reject) => {
    let idx = 0;
    const nextLoop = () => {
      if (idx < arr.length) {
        makePromise(arr[idx++]).then(nextLoop).catch(reject);
      } else {
        resolve();
      }
    };

    nextLoop();
  });

/**
 * Parallel execute promises over elements of an array.
 */
export const paralleling = <T, S>(
  arr: T[],
  makePromise: (elm: T) => Promise<S>,
  onError: (error: unknown) => void,
  earlyReject = false
) => safeAllChoice(arr.map(makePromise), onError, earlyReject);

/**
 * Maybe no need.
 */
export const safeAllChoice = <T>(
  arr: Promise<T>[],
  onError: (error: unknown) => void,
  earlyReject = true
) => (earlyReject ? safeAll(arr, onError) : safeAllWait(arr, onError));

/**
 * Like Promise.all, but reports if subsequent promises reject, and waits for all promises to settle.
 *
 * - Waits for all to settle like Promise.allSettled, but throws if any promise throws.
 * - errors are reported to onError right away. So the error is reported, even if some promises get
 *    stuck, and this never settles either.
 * - first error is both reported and used for rejection, i.e. duplicated. (this is a drawback, but unavoidable, for early reporting)
 *
 */
export const safeAllWait = <T>(
  arr: Promise<T>[],
  onError: (error: unknown) => void
) =>
  safeAll(arr, onError).catch((firstError: unknown) => {
    //report the first error early
    onError(firstError);

    //wait for all to settle, but ignore those, that might resolve.
    return Promise.allSettled(arr).then(() => {
      throw firstError;
    });
  });

/**
 * Like Promise.all, but reports if subsequent promises reject.
 *
 * - Rejects at first rejection
 * - Reports if subsequent promises reject.
 * - The first rejection, if any, is not given to onError. User can handle that.
 *
 * note
 *  Code duplication with safeRace.
 */
export const safeAll = <T>(
  arr: Promise<T>[],
  onError: (error: unknown) => void
) => {
  let firstError: unknown;

  return Promise.all(arr)
    .catch((error) => {
      // save error, so we can avoid to resend it.
      firstError = error;

      throw error; //identity
    })
    .finally(() => {
      // first attach listeners here, when above have fired, so we can be sure to know,
      // which rejection is already reported, and should be ignored here.
      arr.forEach((promise) => {
        promise.catch((error: unknown) => {
          if (error !== firstError) {
            onError(error);
          }
        });
      });
    });
};

/**
 * Like promise race, but reports if any of the loosing promises reject.
 */
export const safeRace = <T, P extends Promise<T>>(
  arr: P[],
  onError: (error: unknown) => void
) => {
  let raceError: unknown;

  const race = Promise.race(arr)
    .catch((error) => {
      // save error, so we can avoid to resend it.
      raceError = error;

      throw error; //identity
    })
    .finally(() => {
      // first attach listeners here, when above have fired, so we can be sure to know,
      // which rejection is already reported, and should be ignored here.
      arr.forEach((promise) => {
        promise.catch((error: unknown) => {
          if (error !== raceError) {
            onError(error);
          }
        });
      });
    });

  return race;
};

/**
 * hardTimeRace
 *
 * - This function will be a no-op, if timeout is undefind or non-positive.
 * - It's reported, if the promise settles after timeout.
 *
 */
export const timeRace2 = (
  promise: Promise<unknown>,
  onError: (error: unknown, extraInfo?: Array<unknown>) => void,
  timeout?: number,
  name = ""
) => {
  if (timeout === undefined || timeout <= 0) {
    return promise;
  }

  const fallback = (prom: Promise<unknown>) =>
    prom
      .then((result: unknown) => {
        onError(makeJabError(name + " resolved after timeout", result));
      })
      .catch((error: unknown) => {
        onError(error, [name + " rejected after timeout"]);
      });

  return timeRace(
    promise,
    fallback,
    timeout,
    name + " timeout (" + timeout + "ms)"
  );
};

/**
 * Wrap a promise, and throw an error, if timeout expires.
 *
 * - fallback-function is called with the promise, if timeout happened.
 */
export const timeRace = <T>(
  promise: Promise<T>,
  fallback: (promise: Promise<T>) => void,
  timeoutms: number,
  timeoutMsg?: string
) => {
  const betterError = new Error(timeoutMsg || "Timeout (" + timeoutms + "ms)");

  return fullRace([
    { promise, fallback },
    {
      promise: sleeping(timeoutms).then(() => {
        throw betterError;
      }),
      fallback: () => {},
    },
  ]);
};

/**
 * Like Promise.race, but callbacks are called with the loosing promises as args.
 */
export const fullRace = <T>(
  arr: Array<{ promise: Promise<T>; fallback: (promise: Promise<T>) => void }>
) => {
  const promises = arr.map((elm, index) =>
    elm.promise
      .then((data) => {
        //fetch index of the winner, and data
        return { winner: index, data };
      })
      .catch((error) => {
        //fetch index of the winner, and error
        return { winner: index, error };
      })
  );

  return Promise.race(promises).then((info) => {
    //call fallbacks (for all but the winner)

    arr.forEach((elm, index) => {
      if (index !== info.winner) {
        elm.fallback(elm.promise);
      }
    });

    //settle to the winner

    if ("data" in info) {
      return info.data;
    }

    if ("error" in info) {
      throw info.error;
    }

    throw new Error("Impossible");
  });
};

/**
 * Wrap a callback for promise.catch(), to ensure an exception doesn't squash the original error.
 *
 * - Ensures that a rejection is still reported, if the callback throws.
 */
export const safeCatch =
  (onError: (error: unknown) => void, func: (error: unknown) => unknown) =>
  (error: unknown) => {
    try {
      func(error);
    } catch (e) {
      //the call back threw, so report the original error. (it is the first error)

      onError(error);

      //reject the promise with the new error. As it's older, so it's strange if it gets reported first.

      throw e;
    }

    //no exception in the callback, so throw the original error.

    throw error;
  };

/**
 * Attaches a "safe" finally-function to a promise.
 *
 * - Behaves exactly as `prom.finally(func)`, except:
 * - Ensures that a rejection in the "source" is still reported, if the finally-function throws.
 *
 * This is needed, when both fail, because only one error can be returned, and that is the
 *  one from the finally-function. The one from the "source" promise is silenced.
 *
 * note
 *  - It's not possible to just wrap the finally-callback. Because a finally-callback doesn't
 *       have access to the original error.
 */
export const safeFinally = <T>(
  prom: Promise<T>,
  func: () => unknown,
  onError: (error: unknown) => void
) => {
  let sourceError: unknown;

  return prom
    .catch((error: unknown) => {
      sourceError = error;

      throw error; //identity
    })
    .finally(() =>
      Promise.resolve()
        .then(func)
        .catch((error: unknown) => {
          if (sourceError) {
            onError(sourceError);
          }
          throw error; //identity
        })
    );
};

/**
 *
 */
export const getPromise = <T>(): PromiseTriple<T> => {
  let resolve!: PromiseTriple<T>["resolve"];
  let reject!: PromiseTriple<T>["reject"];

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

/**
 *
 */
export const getPromiseNodeStyle = <T>() => {
  let callback!: (err: Error | null, val: T) => void;

  const promise = new Promise<T>((res, rej) => {
    callback = (err: Error | null, val: T) => {
      if (err) {
        rej(err);
      } else {
        res(val);
      }
    };
  });

  return { promise, callback };
};

/**
 * - resolves to void if nothing wrong.
 * - rejects both on value and rejection
 */
export const assertUnsettled = (
  _promise: Promise<unknown>,
  onError: (error: unknown) => void,
  timeout = 10
) => {
  //somewhat hacky, but the stack trace in lambda below gives no relevant information. So why not?
  const betterError = makeJabError("assertUnsettled() - placeholder.");

  //setup

  let hasResolved = false;

  const symbol = Symbol("timeout");

  const timeoutPromise = sleepingValue(timeout, symbol);

  const promise = _promise.then((data) => {
    if (hasResolved) {
      //report, that it resolved after timeout
      betterError.reset("Promise resolved after timeout.", data);
      onError(betterError);
    } else {
      return data;
    }
  });

  //do it

  return safeRace([promise, timeoutPromise], onError)
    .finally(() => {
      hasResolved = true;
    })
    .then((val) => {
      if (val === symbol) {
        //happy path.
        return;
      } else {
        betterError.reset("Promise was resolved.", val);
        throw betterError;
        // throw err("Promise was resolved: ", val);
      }
    });
};

export type SetTimeoutFunction = (
  callback: (...args: any[]) => void,
  ms?: number,
  ...args: any[]
) => any;

/**
 * - catch errors and report them to onError, instead of just writing to console.
 */
export const makeCatchingSetTimeout =
  (
    onError: OnError,
    orgSetTimeout: SetTimeoutFunction = (global as any).setTimeout
  ): SetTimeoutFunction =>
  (callback: (...args: any[]) => void, ms?: number, ...args: any[]) =>
    orgSetTimeout(
      (...innerArgs) => {
        try {
          callback(...innerArgs);
        } catch (error) {
          onError(error, ["uh-exception"]);
        }
      },
      ms,
      ...args
    );

/**
 * Await promises dynamically. Meaning the array of promises can be added during wait.
 */
export class PromiseAwait {
  private promiseCount = 0;
  private settleCount = 0;
  private prom?: PromiseTriple<void>;

  constructor(
    private deps: {
      onError: (error: unknown, extraInfo?: Array<unknown>) => void;
    }
  ) {}

  /**
   *
   */
  public await = (p: Promise<unknown>) => {
    this.promiseCount++;

    p.catch(this.deps.onError).finally(() => {
      this.settleCount++;

      if (this.prom && this.promiseCount === this.settleCount) {
        this.prom.resolve();
      }
    });
  };

  /**
   *
   */
  public start = () => {
    if (this.prom) {
      throw new Error("Multiple use not implemented");
    }

    if (this.promiseCount === this.settleCount) {
      return Promise.resolve();
    }

    this.prom = getPromise();

    return this.prom.promise;
  };
}
