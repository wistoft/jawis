import { makeTypedArray } from "^jab";

import { TestProvision } from "^jarun";

//length too large

export default (prov: TestProvision) => {
  makeTypedArray(new Uint16Array(5), Uint16Array, 0, 10);
};
