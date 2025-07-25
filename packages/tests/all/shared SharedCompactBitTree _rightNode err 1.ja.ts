import { TestProvision } from "^jarun";
import { _rightNode } from "^shared-page-heap/internal";

//index can't be larger than size.

export default (prov: TestProvision) => {
  prov.eq(_rightNode(2, 1), false);
};
