//util

import { assert } from "^jab";

type MessureType =
  | {
      type: "all";
      request: string;
    }
  | {
      type: "resolve";
      request: string;
    }
  | {
      type: "compile";
      filename: string;
    }
  | {
      type: "load";
      filename: string;
    };

type Result = MessureType & { ns: bigint; ownNs: bigint; nestLevel: number };

export const makeMeasure = (hrtime = process.hrtime.bigint) => {
  let active = true;
  const measureResult: Result[] = [];
  const stack: bigint[] = []; //for children to record their spending

  /**
   *
   * - Calculate the own exec time, by excluding sub calls to this.
   */
  const measure = <R>(work: () => R, type: MessureType) => {
    const s = hrtime();

    if (!active) {
      throw new Error("Not active");
    }

    const preStackLength = stack.length;

    stack.push(BigInt(0)); //children has used zero time here.

    // let res;
    // let threw;

    try {
      return work();
    } finally {
      // try {
      // } catch (error) {
      //   threw = error;
      //   // console.log("threw: " + error.message);
      // }

      const ns = hrtime() - s;

      measureResult.push({
        ...type,
        ns,
        ownNs: ns - stack[stack.length - 1],
        nestLevel: stack.length,
      });

      // remove own entry

      stack.pop();

      assert(stack.length === preStackLength, "Wrong stack size", {
        preStackLength,
        stack,
        measureResult,
      });

      // record time used, if there's a parent.

      if (stack.length > 0) {
        stack[stack.length - 1] += ns;
      }
    }
  };

  const getResult = () => {
    active = false;

    assert(stack.length === 0, "Assert failed", { stack });

    return measureResult;
  };

  return {
    measure,
    getResult,
  };
};
