import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//delete twice (different reference-object)

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  const a = list.appendNew(Int32Array, Int32Array);
  const clone = list.get(a.ref, Int32Array, Int32Array);

  list.delete(a);
  list.delete(clone);
};
