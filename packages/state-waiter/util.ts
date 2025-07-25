import { Waiter } from "./internal";

/**
 * Turn a callback interface into a waiter interface.
 *
 *  - Returns callbacks, that can be added elsewhere, and they will driver the waiter.
 *  - Returns a waiter with the specified events.
 */
export const getDynamicWaiter = <E extends string>(
  events: E[],
  onError: (error: unknown) => void
) => {
  const waiter = new Waiter<"ready", E>({
    onError,
    startState: "ready",
  });

  const callbacks: { [K in E]: () => void } = {} as any;

  for (const event of events) {
    callbacks[event] = () => {
      waiter.event(event);
    };
  }

  return { waiter, callbacks };
};
