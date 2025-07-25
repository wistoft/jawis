import { AbsoluteFile, assert, assertEq } from "^jab";
import { TestProvision } from "^jarun";
import { equal } from "^shared-algs";
import {
  data3,
  getSharedDynamicMap,
  makeSharedDynamicMap,
  runLiveJacsBee_lazy,
} from "^tests/_fixture";

//local can make data and remote can modify

export default async (prov: TestProvision) => {
  const map = getSharedDynamicMap(prov);

  map.set(data3, data3);

  await runLiveJacsBee_lazy(prov, __filename as AbsoluteFile, {
    pack: map.pack(),
  });

  assertEq(map.count, 0);

  map.dispose();
};

/**
 *
 */
export const main = makeSharedDynamicMap((map, prov) => {
  assertEq(map.count, 1);

  assert(equal(data3, map.get(data3)!));

  map.delete(data3);
});
