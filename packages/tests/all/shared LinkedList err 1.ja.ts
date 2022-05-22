import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//data size must fit in page size.

export default (prov: TestProvision) => {
  getSharedDoublyLinkedList(prov, { dataSize: 1000 });
};
