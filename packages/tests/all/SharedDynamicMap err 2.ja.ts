import { TestProvision } from "^jarun";
import { data1, getSharedDynamicMap } from "^tests/_fixture";

//not impl

//not enough space to allocate the initial structure.

export default (prov: TestProvision) => {
  getSharedDynamicMap(prov, {
    byteSize: 100,
  });
};
