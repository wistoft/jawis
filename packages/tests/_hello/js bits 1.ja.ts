import { TestProvision } from "^jarun";

//bit representation from int32 to uint32

export default (prov: TestProvision) => {
  prov.eq(0xfffffffe, Uint32Array.from([-2])[0]);
  prov.eq(0xffffffff, Uint32Array.from([-1])[0]);

  prov.eq(0xffffffff, Uint32Array.from([0xffffffff])[0]);

  //making negation work

  prov.eq(0xffffffff, Uint32Array.from([~~0xffffffff])[0]);

  //toString gives weird results when signbit is set.

  //it seems `toString` doesn't see the number as int32

  prov.eq("1111111111111111111111111111111", (0x7fffffff).toString(2));
  prov.eq("-1111111111111111111111111111111", (-0x7fffffff).toString(2));
  prov.eq("-10000000000000000000000000000000", (-0x80000000).toString(2));
  prov.eq("-100000000000000000000000000000000", (-0x100000000).toString(2));
  prov.eq("11111111111111111111111111111111", (0xffffffff).toString(2));
  prov.eq("-1", (-1).toString(2));
};
//
