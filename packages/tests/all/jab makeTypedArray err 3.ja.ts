import { makeTypedArray } from "^jab";

import { TestProvision } from "^jarun";

//offset is negative. And buffer has forbidden data there.

export default (prov: TestProvision) => {
  const buffer = new ArrayBuffer(100);

  makeTypedArray(new Uint8Array(buffer, 10, 10), Uint16Array, -2, 6);
};
