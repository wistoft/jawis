import { TestProvision } from "^jarun";
import { _getJumpLength } from "^shared-page-heap/internal";

export default (prov: TestProvision) => {
  prov.eq(0, _getJumpLength(0));
  prov.eq(1, _getJumpLength(1));
  prov.eq(0, _getJumpLength(2));
  prov.eq(2, _getJumpLength(3));
  prov.eq(0, _getJumpLength(4));
  prov.eq(1, _getJumpLength(5));
  prov.eq(0, _getJumpLength(6));
  prov.eq(4, _getJumpLength(7));
  prov.eq(0, _getJumpLength(8));
  prov.eq(1, _getJumpLength(9));
};
