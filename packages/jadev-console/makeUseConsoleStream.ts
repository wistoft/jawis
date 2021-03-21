import { EventController } from "^jab";
import { makeUseEventStream } from "^jab-react";

import { ConsoleEntry, CaptureCache } from ".";

export type UseConsoleStream = (
  listener: (entries: ConsoleEntry[]) => void
) => void;

/**
 * Consume the captured "console".
 *
 * todo
 *  - needs to be pure, otherwise it's not consistent to do `useState(makeUseConsoleStream)`
 */
export const makeUseConsoleStream = (
  windowProperty = "__JadevConsoleCapture"
) => {
  const eventSink = new EventController<ConsoleEntry[]>();

  const captureCache = (window as any)[windowProperty] as
    | CaptureCache
    | undefined;

  if (captureCache === undefined) {
    throw new Error("ConsoleCapture is not active.");
  }

  // todo:
  // if (captureCache.onChange !== undefined) {
  //   throw new Error("useConsoleStream is already already made.");
  // }

  //register onChange for console capture.

  captureCache.onChange = makeConsoleChangeCallback(
    eventSink,
    captureCache,
    100,
    20
  );

  //onChange is called on mount, so the event stream starts, when a listener is attached.

  return makeUseEventStream(eventSink, captureCache.onChange);
};

//
// util
//

/**
 * - Fire async, to avoid problems with producers. E.g. react rendering.
 * - Clone the data.
 * - Clear the cache, when data is sent.
 * - Throttle the events and batch them into one event.
 * - Only send events, when there are listeners attached.
 *
 * Protect against infinite loop.
 * - Don't use any of the captured facilities. I.e. console.log().
 * - Limit the event amount/speed. To protect against infinite loop, if errors happen in console capture.
 *    Or the code presenting fx do a console.log. It will happen during debugging/development.
 */
export const makeConsoleChangeCallback = (
  eventSink: EventController<ConsoleEntry[]>,
  captureCache: CaptureCache,
  maxEntries: number,
  timeoutDelay: number
) => {
  let timeoutHandle: any;
  let dataSeen = 0;
  let keepRunning = true;

  const fireEventBatch = () => {
    //manage

    dataSeen += captureCache.data.length;
    timeoutHandle = undefined;

    //protect against too many entries.

    if (dataSeen >= maxEntries) {
      keepRunning = false;

      captureCache.data.push({
        type: "log",
        logName: "control",
        context: "browser",
        data: [
          "Jadev Console reached max entries (" + maxEntries + "): ",
          dataSeen,
        ],
      });
    }

    //send

    eventSink.fireEvent(captureCache.data);

    //clear cache - bug: clear should be done before fireEvent(), because external could put data in cache, and then we destroy it.

    captureCache.data = [];
  };

  return () => {
    if (
      timeoutHandle === undefined &&
      eventSink.hasListeners() &&
      keepRunning
    ) {
      timeoutHandle = setTimeout(fireEventBatch, timeoutDelay);
    }
  };
};
