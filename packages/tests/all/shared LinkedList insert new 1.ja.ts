import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//insert new node

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  const a1 = list.appendNew();

  prov.eq(undefined, list.prevRef(a1));
  prov.eq(undefined, list.nextRef(a1));

  const a2 = list.insertNew(a1);

  prov.eq(undefined, list.prevRef(a1));
  prov.eq(a2.ref, list.nextRef(a1));

  prov.eq(a1.ref, list.prevRef(a2));
  prov.eq(undefined, list.nextRef(a2));

  //clean up

  list.delete(a1);
  list.delete(a2);

  list.dispose();
};
