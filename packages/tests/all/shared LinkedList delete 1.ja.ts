import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//delete root (the only node)

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  const root = list.appendNew();

  list.delete(root);

  prov.eq(undefined, list.getHead());

  list.dispose();
};
