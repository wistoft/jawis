import { assert } from "^jab";

let enabled = false;

/**
 * Get access to Error objects as soon as possible.
 *
 * - It's not perfect. A simple try/catch could hide errors from this service.
 *
 */
export const onThrow = (onError: (error: unknown) => void) => {
  assert(!enabled, "Already enabled");
  enabled = true;

  const OriginalPromise = Promise; //captured at enable-time.

  Promise = makePromiseConstructor(OriginalPromise, onError) as any;

  Promise.prototype.then = makeMockPromiseThen(OriginalPromise, onError);
};

/**
 * - very problematic for `prom instanceof Promise`
 */
export const makePromiseConstructor = (
  OriginalPromise: any,
  callback: (error: unknown) => void
) => {
  function PromiseConstructor(
    executor: (
      resolve: (value: any) => void,
      reject: (reason?: any) => void
    ) => void
  ) {
    const prom = new OriginalPromise(
      (resolve: (value: any) => void, reject: (reason?: any) => void) => {
        executor(resolve, (reason?: any) => {
          callback(reason);
          reject(reason);
        });
      }
    );

    return prom;
  }

  //copy all static properties from Error

  //duplication between makeProxyErrorForLongTrace and makePromiseConstructor

  for (const method of Object.getOwnPropertyNames(OriginalPromise)) {
    if (
      method === "length" ||
      method === "name" ||
      method === "caller" ||
      method === "callee" ||
      method === "arguments"
    ) {
      continue;
    }

    (PromiseConstructor as any)[method] = (OriginalPromise as any)[method];
  }

  return PromiseConstructor;
};

/**
 *
 */
const makeMockPromiseThen = (
  OriginalPromise: any,
  onError: (error: unknown) => void
) => {
  const Promise_then = OriginalPromise.prototype.then;

  return function then(this: Promise<unknown>, onfulfilled, onrejected) {
    if (!onfulfilled) {
      return Promise_then.call(this, onfulfilled, onrejected);
    }

    return Promise_then.call(
      this,
      (value: unknown) => {
        try {
          return onfulfilled(value);
        } catch (error) {
          onError(error);
          throw error;
        }
      },
      onrejected
    );
  } as Promise<unknown>["then"];
};
