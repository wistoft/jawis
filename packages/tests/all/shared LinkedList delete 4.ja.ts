import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//delete no-root with following nodes.

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  const root = list.appendNew();
  const a1 = list.insertNew(root);
  const a2 = list.insertNew(a1);

  list.delete(a1);

  prov.eq(root.ref, list.getHead()?.ref);

  prov.eq(undefined, list.prevRef(root));
  prov.eq(a2.ref, list.nextRef(root));

  prov.eq(root.ref, list.prevRef(a2));
  prov.eq(undefined, list.nextRef(a2));

  //clean up

  list.delete(root);
  list.delete(a2);

  list.dispose();
};
