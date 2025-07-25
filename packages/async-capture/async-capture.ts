import {
  capture,
  PendingCapturedPromise,
  CapturedValue,
  CustomCapture,
  unknownToErrorData,
} from "^jab";
import { fullRace, sleeping } from "^yapu";

/**
 * - The returned value is mutable. onUpdate is called each time it is mutated.
 * - No timeout: set timeout to zero.
 * - Doesn't recurse into values from resolved promises. Ordinary capture is just used for that.
 * - onError is called for all rejections.
 */
export const asyncCapture = (
  value: unknown,
  timeoutms = 0,
  onUpdate: (
    value: CapturedValue,
    type: "resolved" | "rejected"
  ) => void = () => {},
  onError: (error: unknown) => void = () => {},
  externalCustomCapture: CustomCapture = () => null,
  includeErrorStack = false
): Promise<CapturedValue> => {
  let resolved = false;

  const readyArray = [] as Promise<unknown>[];

  const customCapture: CustomCapture = (value: unknown) => {
    //custom

    const tmp = externalCustomCapture(value);

    if (tmp !== null) {
      return tmp;
    }

    //default

    if (!(value instanceof Promise)) {
      return null;
    } else {
      const holder = {} as PendingCapturedPromise;

      const fallback = () => {
        holder.timeout = "Timeout (" + timeoutms + "ms)";
      };

      const wrapped = value
        .then((data) => {
          holder.resolve = capture(data);

          if (resolved) {
            onUpdate(captured, "resolved");
          }
        })
        .catch((error) => {
          const data = unknownToErrorData(error);
          if (!includeErrorStack) {
            data.stack = "filtered" as any;
          }
          holder.reject = capture(data);

          onError(error);

          if (resolved) {
            onUpdate(captured, "rejected");
          }
        });

      if (timeoutms === 0) {
        readyArray.push(wrapped);
      } else {
        const readyProm = fullRace([
          { promise: wrapped, fallback },
          {
            promise: sleeping(timeoutms), //just to make the other-one looser.
            fallback: () => {},
          },
        ]);

        readyArray.push(readyProm);
      }

      return { replace: ["promise", holder] };
    }
  };

  const captured = capture(value, undefined, customCapture);

  return Promise.all(readyArray).then(() => {
    resolved = true;
    return captured;
  });
};
