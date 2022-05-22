import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//delete no-root without following nodes.

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  const root = list.appendNew(Int32Array, Int32Array);
  const a1 = list.insertNew(root, Int32Array, Int32Array);

  list.delete(a1);

  prov.eq(root.ref, list.getHead(Int32Array, Int32Array)?.ref);

  prov.eq(undefined, list.prevRef(root));
  prov.eq(undefined, list.nextRef(root));

  //clean up

  list.delete(root);
};
