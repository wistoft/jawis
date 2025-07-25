import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//there is only one chunk per page.

export default (prov: TestProvision) => {
  getSharedChunkHeap(prov, { dataSize: 60, pageSize: 88 });
};
