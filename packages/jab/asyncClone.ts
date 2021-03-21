import {
  clone,
  ClonedValue,
  CustomClone,
  fullRace,
  sleeping,
  unknownToErrorData,
} from ".";

export type ClonedPromisePending = {
  resolve?: ClonedValue;
  reject?: ClonedValue;
  timeout?: string;
};

/**
 * - The returned value is mutable. onUpdate is called each time it is mutated.
 * - No timeout: set timeout to zero.
 * - Doesn't recurse into values form resolved promises. Ordinary clone is just used for that.
 * - onError is called for all rejections.
 */
export const asyncClone = (
  value: unknown,
  timeoutms = 0,
  onUpdate: (
    value: ClonedValue,
    type: "resolved" | "rejected"
  ) => void = () => {},
  onError: (error: unknown) => void = () => {},
  externalCustomClone: CustomClone = () => null,
  includeErrorStack = false,
  orgPromise: PromiseConstructor = Promise //quick fix
): Promise<ClonedValue> => {
  let resolved = false;

  const readyArray = [] as Promise<unknown>[];

  const customClone: CustomClone = (value: unknown) => {
    //custom

    const tmp = externalCustomClone(value);

    if (tmp !== null) {
      return tmp;
    }

    //default

    if (!(value instanceof orgPromise)) {
      return null;
    } else {
      const holder = {} as ClonedPromisePending;

      const fallback = () => {
        holder.timeout = "Timeout (" + timeoutms + "ms)";
      };

      const wrapped = value
        .then((data) => {
          holder.resolve = clone(data);

          if (resolved) {
            onUpdate(cloned, "resolved");
          }
        })
        .catch((error) => {
          const data = unknownToErrorData(error);
          if (!includeErrorStack) {
            data.stack = "filtered" as any;
          }
          holder.reject = clone(data);

          onError(error);

          if (resolved) {
            onUpdate(cloned, "rejected");
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

  const cloned = clone(value, undefined, customClone);

  return Promise.all(readyArray).then(() => {
    resolved = true;
    return cloned;
  });
};
