import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  for (const elm of list) {
    prov.log("empty", elm);
  }

  const a = list.appendNew(Int32Array, Int32Array);

  a.nodeData.fill(7);
  a.data.fill(9);

  for (const elm of list) {
    prov.log("one element", elm);
  }

  const b = list.insertNew(a, Int32Array, Int32Array);

  b.nodeData.fill(17);
  b.data.fill(19);

  for (const elm of list) {
    prov.log("two elements", elm);
  }

  //clean up

  list.delete(a);
  list.delete(b);
};
