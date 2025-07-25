import { sleeping } from "^yapu";
import { TestProvision } from "^jarun";
import {
  empty,
  getSharedDynamicMap,
  makeSharedDynamicMap,
  runLiveJacsBee_lazy,
} from "^tests/_fixture";
import { AbsoluteFile, assert, def, getRandomUint8Array } from "^jab";
import { SharedDynamicMap } from "^shared-dynamic-map/internal";

//make each operation depend on the other thread

export default async (prov: TestProvision) => {
  const map = getSharedDynamicMap(prov, {}, 1000 * 1000);

  const otherProm = runLiveJacsBee_lazy(prov, __filename as AbsoluteFile, {
    pack: map.pack(),
  });

  const amount = 30;

  await play(map, true, amount);

  await otherProm;

  prov.eq(0, map.count);

  map.dispose();
};

/**
 *
 */
export const main = makeSharedDynamicMap((map) => {
  play(map, false, Number.MAX_SAFE_INTEGER);
});

/**
 *
 */
const play = async (
  map: SharedDynamicMap,
  primary: boolean,
  amount: number
) => {
  let value: Uint8Array;

  if (primary) {
    assert(map.get(empty) === undefined);

    value = getRandomUint8Array(1, 10);

    map.set(empty, value); //start other thread
  } else {
    value = empty;
  }

  if (value === undefined) {
    throw new Error("Impossible");
  }

  //loop

  let i = 0;

  while (true) {
    while (map.get(value) === undefined) {
      await sleeping(1);
    }

    const otherValue = def(map.get(value));

    map.delete(value);

    if (otherValue.length === 0) {
      //termination of secondary thread
      break;
    }

    if (++i >= amount) {
      map.set(otherValue, empty); //stop other thread
      break;
    }

    value = getRandomUint8Array(1, 10);

    map.set(otherValue, value); //start other thread
  }
};
