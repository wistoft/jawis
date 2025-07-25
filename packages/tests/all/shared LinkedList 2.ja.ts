import { err } from "^jab";
import { TestProvision } from "^jarun";
import { getSharedDoublyLinkedList } from "^tests/_fixture";

//get arrays

export default (prov: TestProvision) => {
  const list = getSharedDoublyLinkedList(prov);

  const alloc = list.appendNew();

  const { data } = list.get(alloc.ref);

  //check they don't interfere

  data.fill(9);

  if (data.some((val: any) => val !== 9)) {
    err("Data is wrong", { data });
  }

  list.delete(alloc);

  list.dispose();
};
