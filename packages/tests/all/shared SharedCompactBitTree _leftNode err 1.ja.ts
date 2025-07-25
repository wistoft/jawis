import { TestProvision } from "^jarun";
import { _leftNode } from "^shared-page-heap/internal";

//index out of bounds

export default (prov: TestProvision) => {
  _leftNode(-1);
};
