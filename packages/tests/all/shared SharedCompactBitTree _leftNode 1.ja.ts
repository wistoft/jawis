import { TestProvision } from "^jarun";
import { _leftNode } from "^shared-page-heap/internal";

export default (prov: TestProvision) => {
  prov.eq(_leftNode(0), undefined);
  prov.eq(_leftNode(1), 0);
  prov.eq(_leftNode(2), undefined);
  prov.eq(_leftNode(3), 1);
  prov.eq(_leftNode(4), undefined);
  prov.eq(_leftNode(5), 4);
  prov.eq(_leftNode(6), undefined);
  prov.eq(_leftNode(7), 3);
  prov.eq(_leftNode(8), undefined);
  prov.eq(_leftNode(9), 8);
  prov.eq(_leftNode(10), undefined);
  prov.eq(_leftNode(11), 9);
  prov.eq(_leftNode(12), undefined);
  prov.eq(_leftNode(13), 12);
  prov.eq(_leftNode(14), undefined);
  prov.eq(_leftNode(15), 7);
};
