import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//get data array, that doesn't divide data size

export default (prov: TestProvision) => {
  getSharedDoublyLinkedList(prov, { dataSize: 6 }).appendNew(
    Int8Array,
    Int32Array
  );
};
