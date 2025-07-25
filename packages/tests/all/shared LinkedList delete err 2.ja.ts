import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//delete twice (different reference-object)

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  const a = list.appendNew();
  const clone = list.get(a.ref);

  list.delete(a);

  try {
    list.delete(clone);
  } finally {
    list.dispose();
  }
};
