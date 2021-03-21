import { err, JabError } from ".";

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
export const then = (func: () => void) => Promise.resolve().then(func);

/**
 * Keep execute the promises, until one returns false.
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
 * Sequential execute promises over elements of an array.
 * Break/reject on first rejection.
 */
export const looping = <T>(arr: T[], makePromise: (elm: T) => Promise<void>) =>
  new Promise<void>((resolve, reject) => {
    let idx = 0;
    const nextLoop = () => {
      if (idx < arr.length) {
        makePromise(arr[idx++])
          .then(nextLoop)
          .catch(reject);
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
 * - The first, if any, rejection is not given to onError. User can handle that.
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
 * Like Promise.race, and a callback is called for each of the loosing promises.
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
export const safeCatch = (
  onError: (error: unknown) => void,
  func: (error: unknown) => unknown
) => (error: unknown) => {
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
 * - resolves to void if nothing wrong.
 * - rejects both on value and rejection
 */
export const assertUnsettled = (
  _promise: Promise<unknown>,
  onError: (error: unknown) => void,
  timeout = 10
) => {
  //somewhat hacky, but the stack trace in lambda below gives no relevant information. So why not?
  const betterError = new JabError("assertUnsettled() - placeholder.");

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
