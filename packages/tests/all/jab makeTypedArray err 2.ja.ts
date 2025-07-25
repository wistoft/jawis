import { makeTypedArray } from "^jab";

import { TestProvision } from "^jarun";

//offset too large

export default (prov: TestProvision) => {
  makeTypedArray(new Uint16Array(5), Uint16Array, 10, 1);
};
