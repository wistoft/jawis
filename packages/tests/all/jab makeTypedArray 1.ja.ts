import { makeTypedArray } from "^jab";

import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.eq(new Uint16Array(1), makeTypedArray(new Uint16Array(5), Uint16Array, 0, 1)); // prettier-ignore
  prov.eq(new Uint8Array(2), makeTypedArray(new Uint16Array(5), Uint8Array, 0, 2)); // prettier-ignore

  //last element in array

  prov.eq(new Uint8Array(1), makeTypedArray(new Uint8Array(5), Uint8Array, 4, 1)); // prettier-ignore
};
