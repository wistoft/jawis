import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//delete twice (the same reference-object)

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  const a = list.appendNew(Int32Array, Int32Array);

  list.delete(a);
  list.delete(a);
};
