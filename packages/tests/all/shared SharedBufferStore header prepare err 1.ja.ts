import { TestProvision } from "^jarun";
import { getAppendOnlyBufferStore } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const store = getAppendOnlyBufferStore(prov);

  store.headerUtil.prepare(0, {
    version: 2,
    bufferLength: 3,
    alignment: 5, //invalid alignment.
  });
};
