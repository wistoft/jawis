export const assert = (val: boolean | undefined, msg = "Assert failed.") => {
  if (val) {
    return;
  }

  throw new Error(msg);
};

export type PromiseTriple<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: Error) => void;
};

export const getPromise = <T>(): PromiseTriple<T> => {
  let resolve!: PromiseTriple<T>["resolve"];
  let reject!: PromiseTriple<T>["reject"];

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};
