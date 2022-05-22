import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//get node array, that doesn't divide node data size

export default (prov: TestProvision) => {
  getSharedDoublyLinkedList(prov, { nodeDataSize: 6 }).appendNew(
    Int32Array,
    Int32Array
  );
};
