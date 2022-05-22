import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//empty list at construction

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  prov.eq(undefined, list.getHead(Int32Array, Int32Array));
};
