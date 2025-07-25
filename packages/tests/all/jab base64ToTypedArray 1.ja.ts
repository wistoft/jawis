import { base64ToTypedArray } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  test2(new Uint8Array([]));
  test2(new Uint8Array([1]));
  test2(new Uint8Array([1, 2, 255]));

  function test2(array: Uint8Array) {
    const base64 = Buffer.from(array).toString("base64");

    prov.eq(array, base64ToTypedArray(base64, Uint8Array));
  }
};
