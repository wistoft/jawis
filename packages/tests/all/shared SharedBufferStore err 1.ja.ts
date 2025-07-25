import { TestProvision } from "^jarun";
import { getAppendOnlyBufferStore } from "^tests/_fixture";

//data exceeds storage size.

export default (prov: TestProvision) => {
  const store = getAppendOnlyBufferStore(prov, {
    byteSize: 100,
  });

  store.add(new TextEncoder().encode("a".repeat(100)));
};
