import { Waiter } from "^jab";

import { TestMainProv } from ".";

type States = "starting" | "ready" | "stopping" | "done";

/**
 *
 */
export const getWaiter = (prov: TestMainProv) =>
  new Waiter<States, never>({
    onError: prov.onError,
    startState: "starting",
    stoppingState: "stopping",
    endState: "done",
  });

/**
 * A waiter with no stopping-state. (shutdown/kill must be sync.)
 */
export const getWaiter_non_stopping = (prov: TestMainProv) =>
  new Waiter<States, never>({
    onError: prov.onError,
    startState: "starting",
    endState: "done",
  });

/**
 * It will resolve to end state in next tick.
 */
export const getWaiter_in_stopping_state = (
  prov: TestMainProv,
  shutdown = true
) => {
  const waiter = getWaiter(prov);

  const shutdownProm = waiter.shutdown(() =>
    Promise.resolve().then(() => {
      if (shutdown) {
        waiter.set("done");
      }
    })
  );

  return [waiter, shutdownProm] as [Waiter<States, never>, Promise<void>];
};

/**
 * It will resolve to end state in next tick.
 */
export const getWaiter_in_killing_state = (prov: TestMainProv, kill = true) => {
  const waiter = getWaiter(prov);

  const killProm = waiter.killReal({
    kill: () =>
      Promise.resolve().then(() => {
        if (kill) {
          waiter.set("done");
        }
      }),
  });

  return [waiter, killProm] as [Waiter<States, never>, Promise<void>];
};

/**
 *
 */
export const getWaiter_stuck_in_stopping_state = (prov: TestMainProv) =>
  getWaiter_in_stopping_state(prov, false);

/**
 *
 */
export const getWaiter_stuck_in_killing_state = (prov: TestMainProv) =>
  getWaiter_in_killing_state(prov, false);

/**
 *
 */
export const getWaiter_waiting = (prov: TestMainProv) => {
  const waiter = getWaiter(prov);

  const prom = waiter.await("done");

  return [waiter, prom] as [Waiter<States, never>, Promise<void>];
};
