import { makeTypedArray } from "^jab";

import { TestProvision } from "^jarun";

//negative length

export default (prov: TestProvision) => {
  makeTypedArray(new Uint8Array(10), Uint8Array, 10, -1);
};
