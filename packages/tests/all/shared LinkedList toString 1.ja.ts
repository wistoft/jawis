import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  prov.log("empty", list.toString());

  const root = list.appendNew();

  prov.log("one element", list.toString());

  //clean up

  list.delete(root);

  list.dispose();
};
