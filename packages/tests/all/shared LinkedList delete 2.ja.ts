import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//delete root with following nodes.

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  const root = list.appendNew();
  const a1 = list.insertNew(root);

  list.delete(root);

  prov.eq(a1.ref, list.getHead()?.ref);

  prov.eq(undefined, list.prevRef(a1));
  prov.eq(undefined, list.nextRef(a1));

  //clean up

  list.delete(a1);

  list.dispose();
};
