import { Waiter, WaiterDeps } from "^state-waiter";

import { TestMainProv } from ".";

type States = "starting" | "ready" | "stopping" | "done";
type Events = "first" | "second";

/**
 *
 */
export const getWaiter = (
  prov: TestMainProv,
  extra: Partial<WaiterDeps<States>> = {}
) =>
  new Waiter<States, Events>({
    onError: prov.onError,
    startState: "starting",
    stoppingState: "stopping",
    endState: "done",
    hardTimeout: 1,
    ...extra,
  });

/**
 * A waiter with no stopping-state. (shutdown/kill must be sync.)
 */
export const getWaiter_non_stopping = (prov: TestMainProv) =>
  new Waiter<States, never>({
    onError: prov.onError,
    startState: "starting",
    endState: "done",
    hardTimeout: 1,
  });

/**
 * It will resolve to end state in next tick.
 */
export const getWaiter_in_stopping_state = (
  prov: TestMainProv,
  shutdown = true,
  extra: Partial<WaiterDeps<States>> = {}
) => {
  const waiter = getWaiter(prov, extra);

  const shutdownProm = waiter.shutdown(() =>
    Promise.resolve().then(() => {
      if (shutdown) {
        waiter.set("done");
      }
    })
  );

  return [waiter, shutdownProm] as [Waiter<States, Events>, Promise<void>];
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

  return [waiter, killProm] as [Waiter<States, Events>, Promise<void>];
};

/**
 *
 */
export const getWaiter_stuck_in_stopping_state = (
  prov: TestMainProv,
  extra: Partial<WaiterDeps<States>> = {}
) => getWaiter_in_stopping_state(prov, false, extra);

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

  return [waiter, prom] as [Waiter<States, Events>, Promise<void>];
};
