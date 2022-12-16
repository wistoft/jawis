import { TestProvision } from "^jarun";
import { sleeping } from "^jab";
import { LoopController } from "^loop-controller";

/**
 *
 */
export const getLoopController = (
  prov: TestProvision,
  arr: number[],
  makePromise: (elm: number) => Promise<unknown>,
  autoStart?: boolean
) =>
  new LoopController({
    initialArray: arr,
    makePromise,
    onError: prov.onError,
    autoStart,
    onStart: () => prov.imp("onStart"),
    onStop: () => prov.imp("onStop"),
  });

/**
 *
 */
export const littleLoop = (prov: TestProvision, autoStart?: boolean) =>
  getLoopController(
    prov,
    [1, 2, 3],
    (n) => {
      prov.imp(n);
      return sleeping(10);
    },
    autoStart
  );

/**
 * The fastest way to iterate.
 */
export const infiniteLoop = (prov: TestProvision, autoStart?: boolean) =>
  getLoopController(
    prov,
    new Array(100000000),
    () => Promise.resolve(),
    autoStart
  );

/**
 *
 */
export const emptyLoop = (prov: TestProvision, autoStart?: boolean) =>
  getLoopController(
    prov,
    [],
    () => {
      prov.imp("unreach");
      return Promise.resolve();
    },
    autoStart
  );
