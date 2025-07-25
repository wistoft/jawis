import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  for (const elm of list) {
    prov.log("empty", elm);
  }

  const a = list.appendNew();

  a.data.fill(9);

  for (const elm of list) {
    prov.log("one element", { ...elm, ref: "filtered" });
  }

  const b = list.insertNew(a);

  b.data.fill(19);

  for (const elm of list) {
    prov.log("two elements", { ...elm, ref: "filtered" });
  }

  //clean up

  list.delete(a);
  list.delete(b);

  list.dispose();
};
