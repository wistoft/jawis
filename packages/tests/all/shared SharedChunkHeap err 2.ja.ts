import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//chunk size can't be negative

export default (prov: TestProvision) => {
  getSharedChunkHeap(prov, { dataSize: -10 });
};
