import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//delete twice (the same reference-object)

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  const a = list.appendNew();

  list.delete(a);

  //node becomes invalid

  prov.catch(() => list.delete(a));
  prov.catch(() => list.prevRef(a));

  list.dispose();
};
