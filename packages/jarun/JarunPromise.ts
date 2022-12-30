import { JarunTestProvision } from "./internal";

type Resolve<T> = (value: T | PromiseLike<T>) => void;

type Executor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void
) => void;

/**
 * Mark rejection-errors with the test provision. Makes it possible to detect rogue test cases.
 *
 * - prov is stored on the error object, so uh-exceptions can be mapped to its test case.
 */
export const createJarunPromise = (prov: JarunTestProvision) =>
  class JarunPromise<T> extends Promise<T> {
    // for debugging and testing.
    public static getActivity = () => JarunPromise.activity;
    public static getResolves = () => JarunPromise.resolves;

    //where promises are created
    public static activity: string[] = [];

    //where promises are resolved.
    //quite awesome - only need to filter Jarun's resolves.
    public static resolves: any[] = [];

    /**
     *
     */
    public static wrapExecutor =
      <T>(executor: Executor<T>): Executor<T> =>
      (resolve, reject) => {
        executor(
          JarunPromise.wrapResolve(resolve),
          JarunPromise.wrapRejection(reject)
        );
      };

    /**
     *
     */
    public static wrapResolve =
      <T>(resolve: Resolve<T>): Resolve<T> =>
      (value) => {
        JarunPromise.resolves.push([
          value,
          new Error("Dummy").stack || "No stack",
        ]);

        resolve(value);
      };

    /**
     *
     */
    public static wrapRejection =
      (reject: (error?: any) => void) => (error?: any) => {
        if (error === null || typeof error !== "object") {
          console.log("JarunPromise: Could not wrap non object.", error);
        } else {
          (error as any)._jarunTestProvision = prov;
        }

        reject(error);
      };

    /**
     *
     */
    constructor(executor: Executor<T>) {
      super(JarunPromise.wrapExecutor(executor));

      JarunPromise.activity.push(new Error("Dummy").stack || "No stack");
    }
  };
