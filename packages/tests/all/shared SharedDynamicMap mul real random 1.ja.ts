import { getPromise, sleeping } from "^yapu";
import { TestProvision } from "^jarun";
import {
  getSharedDynamicMap,
  makeSharedDynamicMap,
  runLiveJacsBee_lazy,
} from "^tests/_fixture";
import {
  AbsoluteFile,
  assert,
  getRandomUint8Array,
  getRandomUint8Array_old,
  toJsCode,
} from "^jab";
import { SharedDynamicMap } from "^shared-dynamic-map/internal";
import { equal } from "^shared-algs";

//run scan in two threads at once

export default async (prov: TestProvision) => {
  const map = getSharedDynamicMap(prov, {}, 1000 * 1000);

  const controlArray = new Int32Array(new SharedArrayBuffer(12));

  const otherReady = getPromise<void>();

  const ownProm = otherReady.promise.then(() => {
    //start when other thread is ready
    return scan(map, controlArray, 1);
  });

  await runLiveJacsBee_lazy(
    prov,
    __filename as AbsoluteFile,
    {
      pack: map.pack(),
      controlArray,
    },
    { onMessage: otherReady.resolve }
  );

  await ownProm;

  map.dispose();
};

/**
 *
 */
export const main = makeSharedDynamicMap((map, prov) => {
  prov.beeSend({}); //start other thread

  //remote doesn't work yet
  scan(map, prov.beeData.controlArray, 2);
});

type ControlData = {
  key: Uint8Array;
  value: Uint8Array;
};

/**
 *
 */
const scan = async (
  map: SharedDynamicMap,
  controlArray: Int32Array,
  index: number
) => {
  const trace: string[] = [];
  let i = 0;
  let j = 0;
  const amount1 = 50;
  const amount2 = 5;

  try {
    const otherIndex = 3 - index;
    let lastOtherCount = -1;

    for (i = 0; i < amount1; i++) {
      //detect context switch

      if (lastOtherCount !== controlArray[otherIndex]) {
        lastOtherCount = controlArray[otherIndex];
        controlArray[index]++;
      }

      //allocate

      const controlMap: Map<string, ControlData> = new Map();

      for (j = 0; j < amount2; j++) {
        const key = getRandomUint8Array(1, 10); //minimum length 1.
        key[0] = index; //ensure the two threads don't interfere
        const value = getRandomUint8Array_old(10);

        trace.push(`map.set(${toJsCode(key)}, ${toJsCode(value)});`);

        map.set(key, value);

        const _key = toJsCode(key); //to ensure Uint8Array can be compared
        controlMap.set(_key, { key, value });
      }

      // sleep - seems to be needed is order to get switches.

      await sleeping(1);

      // deallocate

      for (const [_, expected] of controlMap) {
        const actual = map.get(expected.key)!;

        assert(equal(expected.value, actual), "Map returned wrong value: ", {
          actual,
          expected,
        });

        trace.push(`map.delete(${toJsCode(expected.key)});`);

        map.delete(expected.key);
      }
    }
  } catch (error) {
    console.log(trace.join("\n"));
    throw error;
  } finally {
    // console.log("repeat1: " + i);
    // console.log("repeats: " + (i * amount2 + j));
    // console.log("switches: " + (controlArray[index] - 1));
  }
};
