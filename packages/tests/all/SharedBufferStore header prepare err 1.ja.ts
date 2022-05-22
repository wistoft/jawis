import { TestProvision } from "^jarun";
import { getSharedBufferStore } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const { store } = getSharedBufferStore(prov);

  store.header.prepare(0, {
    accessCount: 1,
    ref: 2,
    dataLength: 3,
    deleted: false,
    alignment: 5, //invalid alignment.
  });
};
