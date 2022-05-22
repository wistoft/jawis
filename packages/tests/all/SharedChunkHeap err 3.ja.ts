import { TestProvision } from "^jarun";
import { getSharedChunkHeap } from "^tests/_fixture";

//chunk size is larger than page size

export default (prov: TestProvision) => {
  getSharedChunkHeap(prov, { dataSize: 200, pageSize: 88 });
};
