import { TestProvision } from "^jarun";
import { getSharedBufferStore } from "^tests/_fixture";

//data exceeds storage size.

export default (prov: TestProvision) => {
  const { store } = getSharedBufferStore(prov, {
    byteSize: 100,
  });

  store.add(new TextEncoder().encode("a".repeat(100)));
};
