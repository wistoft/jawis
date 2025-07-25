import { toBits } from "^jab";

import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.eq("0b0", toBits(0));
  prov.eq("0b1", toBits(1));
  prov.eq("0b10", toBits(2));
  prov.eq("0b11", toBits(3));
  prov.eq("0b100", toBits(4));

  prov.eq("0b1111111111", toBits(1023));
  prov.eq("0b10000000000", toBits(1024));
  prov.eq("0b10000000001", toBits(1025));

  prov.eq("0b111111111111111111111111111111", toBits(0b111111111111111111111111111111)); // prettier-ignore
  prov.eq("0b1111111111111111111111111111111", toBits(0b1111111111111111111111111111111)); // prettier-ignore
  prov.eq("0b11111111111111111111111111111111", toBits(0b11111111111111111111111111111111)); // prettier-ignore

  prov.eq("0b11111111111111111111111111111110", toBits(0xffffffff - 1));
  prov.eq("0b11111111111111111111111111111110", toBits(0xfffffffe));

  prov.eq("0b11111111111111111111111111111111", toBits(0xffffffff));

  prov.eq("0b11111111111111111111111111", toBits(0x03ffffff));
  prov.eq("0b111111111111111111111111111", toBits(0x07ffffff));
  prov.eq("0b1111111111111111111111111111", toBits(0x0fffffff));
  prov.eq("0b11111111111111111111111111111", toBits(0x1fffffff));
  prov.eq("0b111111111111111111111111111111", toBits(0x3fffffff));
  prov.eq("0b1111111111111111111111111111111", toBits(0x7fffffff));

  prov.eq("0b11111111111111111111111111111111", toBits(-1));
  prov.eq("0b11111111111111111111111111111110", toBits(-2));
};
