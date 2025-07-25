import { TestProvision } from "^jarun";
import { getSharedListHeap } from "^tests/_fixture";

//deallocate twice

export default (prov: TestProvision) => {
  const list = getSharedListHeap(prov);

  const { ref } = list.allocate(Uint32Array);

  list.deallocate(ref);
  list.deallocate(ref);
};
