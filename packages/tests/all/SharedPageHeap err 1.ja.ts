import { TestProvision } from "^jarun";
import { getSharedPageHeap } from "^tests/_fixture";

// not multiple of 4

export default (prov: TestProvision) => {
  getSharedPageHeap(prov, {
    dataSize: 65,
  });
};
