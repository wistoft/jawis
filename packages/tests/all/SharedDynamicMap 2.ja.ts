import { TestProvision } from "^jarun";
import { data1, getSharedDynamicMap } from "^tests/_fixture";

//inner map is resized up and down

export default (prov: TestProvision) => {
  const initialEntryCapacity = 3 * 4; //must be divisible by four, to make last assertation work.

  const map = getSharedDynamicMap(prov, {
    initialEntryCapacity,
    byteSize: 10000,
  });

  const amount = initialEntryCapacity + 1;

  // dynamic resize on adding

  for (let i = 0; i < amount; i++) {
    map.set(Buffer.from("" + i), data1);

    prov.eq(i + 1, map.length);
  }

  prov.chk(map.size > initialEntryCapacity);

  // dynamic resize on deleting

  for (let i = 0; i < amount; i++) {
    map.delete(Buffer.from("" + i));

    prov.eq(amount - 1 - i, map.length);
  }

  //check resized back down

  prov.chk(map.size === initialEntryCapacity);

  map.dispose();
};
