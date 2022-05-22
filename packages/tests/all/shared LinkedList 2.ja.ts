import { err } from "^jab";
import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//get arrays

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  const alloc = list.appendNew(Int32Array, Int32Array);

  const nodeData = list.getNodeDataArray(alloc.ref, Int32Array);
  const data = list.getDataArray(alloc.ref, Int32Array);

  //check they don't interfere

  nodeData.fill(7);
  data.fill(9);

  if (nodeData.some((val) => val !== 7)) {
    err("Data is wrong", { nodeData, data });
  }

  if (data.some((val) => val !== 9)) {
    err("Data is wrong", { nodeData, data });
  }

  list.delete(alloc);
};
