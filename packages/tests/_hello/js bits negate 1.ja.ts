import { TestProvision } from "^jarun";

//negation does x => - (x + 1)

export default (prov: TestProvision) => {
  prov.eq(4294967295, 0xffffffff);

  prov.eq(0, ~-1);

  prov.eq(-1, ~0);
  prov.eq(-2, ~1);
  prov.eq(-3, ~2);

  prov.eq(0, ~0xffffffff);
  prov.eq(1, ~0xfffffffe);
  prov.eq(2, ~0xfffffffd);

  prov.eq(-1, ~~-1);
  prov.eq(0, ~~0);
  prov.eq(1, ~~1);

  prov.eq(0x7fffffff, ~~0x7fffffff);

  //weird

  prov.eq(-2147483648, ~~0x80000000); //overflows because it's int32

  prov.eq(-1, ~~0xffffffff);
};
//
