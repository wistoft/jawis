import { TestProvision } from "^jarun";
import { _getRoot } from "^shared-page-heap/internal";

export default (prov: TestProvision) => {
  prov.eq(0, _getRoot(1));
  prov.eq(1, _getRoot(2));
  prov.eq(1, _getRoot(3));
  prov.eq(3, _getRoot(4));
  prov.eq(3, _getRoot(5));
  prov.eq(3, _getRoot(6));
  prov.eq(3, _getRoot(7));
  prov.eq(7, _getRoot(8));
  prov.eq(7, _getRoot(9));
};
