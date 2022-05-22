import { toBits } from "^jab";

import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  for (let i = 0; i < 32; i++) {
    const bitmask = 1 << i;
    const notbitmask = ~bitmask;

    const zeros = i === 0 ? "" : "0".repeat(i);

    if (i === 31) {
      prov.eq("-1" + zeros, bitmask.toString(2)); //weird
    } else {
      prov.eq("1" + zeros, bitmask.toString(2));
    }

    prov.eq(0, bitmask & notbitmask);
    prov.eq(-1, bitmask | notbitmask);

    prov.eq(0xffffffff, Uint32Array.from([bitmask | notbitmask])[0]); //correct

    console.log(toBits(Uint32Array.from([notbitmask])[0])); //correct

    if (i === 0) {
      prov.chk((notbitmask & 0b1) === 0);
    }

    if (i === 1) {
      prov.chk((notbitmask & 0b10) === 0);
    }

    if (i === 2) {
      prov.chk((notbitmask & 0b100) === 0);
    }

    if (i === 31) {
      prov.chk((notbitmask & 0b10000000000000000000000000000000) === 0);
    }
  }
};
//
