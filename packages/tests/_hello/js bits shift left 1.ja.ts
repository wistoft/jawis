import { toBits } from "^jab";

import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.eq(0x40, 1 << 6);
  prov.eq(0x80, 1 << 7);
  prov.eq(0x100, 1 << 8);

  prov.eq(0x40000000, 1 << 30);

  prov.eq(-0x80000000, 1 << 31); //care must be taken when sign bit is set.
  prov.eq(0x80000000, Uint32Array.from([1 << 31])[0]); //convert back to uint32 works.

  //overflow in shift amount is just mod'ed by 32.

  prov.eq(1, 1 << 32);

  //negative numbers are handled as expected.

  prov.eq("0b11111111111111111111111111111110", toBits(-1 << 1));
  prov.eq("0b11111111111111111111111111111110", toBits(-1 << 1));
  prov.eq("0b11111111111111111111111111111100", toBits(-1 << 2));
  prov.eq("0b11111111111111111111111111111000", toBits(-1 << 3));

  prov.eq(0, -0x80000000 << 1);
};
