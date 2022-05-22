import { TestProvision } from "^jarun";
import { getSharedBufferStore } from "^tests/_fixture";

//get entry that doesn't exist.

export default (prov: TestProvision) => {
  const { store } = getSharedBufferStore(prov);

  store.get(123456);
};
