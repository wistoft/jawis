import { toBits } from "^jab";

import { TestProvision } from "^jarun";

//fails if leftmost bit is set, because sign bit is preserved.
// use `>>>` instead.

export default (prov: TestProvision) => {
  prov.eq(-1, -1 >> 1); //because it's int32

  prov.eq(0, 0 >> 1);
  prov.eq(0, 1 >> 1);

  prov.eq(0x20000000, 0x40000000 >> 1);
  prov.eq(-0x40000000, 0x80000000 >> 1); //breaks because sign bit is preserved.

  const leftmostOneHot = 1 << 31;
  const leftmostOneHot2nd = 1 << 30;

  prov.eq(-leftmostOneHot2nd, leftmostOneHot >> 1);

  prov.eq("0b11000000000000000000000000000000", toBits(leftmostOneHot >> 1));
  prov.eq("0b11100000000000000000000000000000", toBits(leftmostOneHot >> 2));
};
//
