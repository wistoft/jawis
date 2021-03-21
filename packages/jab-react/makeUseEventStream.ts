import { useEffect } from "react";

import { EventStream } from "^jab";

/**
 * Create a hook from a event stream.
 *
 * - The hook can be used to subscribe to the stream.
 *
 */
export const makeUseEventStream = <T extends {}>(
  eventStream: EventStream<T>,
  extraOnMount?: () => void
) => (listener: (data: T) => void) => {
  useEffect(() => {
    eventStream.addListener(listener);
    return () => {
      eventStream.removeListener(listener);
    };
  }, [listener]);

  //can we rely on useEffect to be executed sequentially?

  if (extraOnMount) {
    useEffect(extraOnMount, []);
  }
};
