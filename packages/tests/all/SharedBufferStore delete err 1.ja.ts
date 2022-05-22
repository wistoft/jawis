import { TestProvision } from "^jarun";
import { getSharedBufferStore } from "^tests/_fixture";

//delete entry that doesn't exist.

export default (prov: TestProvision) => {
  const { store } = getSharedBufferStore(prov);

  store.delete(123456);
};
