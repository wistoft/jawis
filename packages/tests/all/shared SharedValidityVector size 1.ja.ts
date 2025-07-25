import { TestProvision } from "^jarun";
import { SharedValidityVector } from "^shared-algs";

export default (prov: TestProvision) => {
  prov.eq(4, SharedValidityVector.getExpectedByteSize(1));
  prov.eq(8, SharedValidityVector.getExpectedByteSize(2));
  prov.eq(12, SharedValidityVector.getExpectedByteSize(3));
};
