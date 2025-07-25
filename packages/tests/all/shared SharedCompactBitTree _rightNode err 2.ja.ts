import { TestProvision } from "^jarun";
import { _rightNode } from "^shared-page-heap/internal";

//index out of bounds

export default (prov: TestProvision) => {
  _rightNode(2, 1);
};
