import { SharedValidityVector } from "^jab-node/SharedValidityVector";
import { TestProvision } from "^jarun";
import { getSharedValidityVector } from "^tests/_fixture";

export default (prov: TestProvision) => {
  prov.eq(4, SharedValidityVector._getExpectedBytesize(1, 1, 4));
  prov.eq(8, SharedValidityVector._getExpectedBytesize(2, 1, 4));
  prov.eq(12, SharedValidityVector._getExpectedBytesize(3, 1, 4));

  prov.eq(4, SharedValidityVector._getExpectedBytesize(1, 4, 1));
  prov.eq(4, SharedValidityVector._getExpectedBytesize(2, 4, 1));
  prov.eq(4, SharedValidityVector._getExpectedBytesize(3, 4, 1));
  prov.eq(4, SharedValidityVector._getExpectedBytesize(4, 4, 1));
  prov.eq(8, SharedValidityVector._getExpectedBytesize(5, 4, 1));
  prov.eq(8, SharedValidityVector._getExpectedBytesize(6, 4, 1));
  prov.eq(8, SharedValidityVector._getExpectedBytesize(7, 4, 1));
  prov.eq(8, SharedValidityVector._getExpectedBytesize(8, 4, 1));
  prov.eq(12, SharedValidityVector._getExpectedBytesize(9, 4, 1));
};
