import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//delete root (the only node)

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  const root = list.appendNew(Int32Array, Int32Array);

  list.delete(root);

  prov.eq(undefined, list.getHead(Int32Array, Int32Array));
};
