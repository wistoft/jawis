import { TestProvision } from "^jarun";
import { _rightNode } from "^shared-page-heap/internal";

export default (prov: TestProvision) => {
  prov.eq(_rightNode(0, 1), undefined);

  prov.eq(_rightNode(1, 2), undefined);
  prov.eq(_rightNode(1, 3), 2);
  prov.eq(_rightNode(1, 4), 2);
  prov.eq(_rightNode(1, 5), 2);

  prov.eq(_rightNode(2, 3), undefined);

  prov.eq(_rightNode(3, 4), undefined);
  prov.eq(_rightNode(3, 5), 4);
  prov.eq(_rightNode(3, 6), 5);
  prov.eq(_rightNode(3, 7), 5);
  prov.eq(_rightNode(3, 8), 5);
  prov.eq(_rightNode(3, 9), 5);

  prov.eq(_rightNode(4, 5), undefined);

  prov.eq(_rightNode(5, 6), undefined);
  prov.eq(_rightNode(5, 7), 6);
  prov.eq(_rightNode(5, 8), 6);
  prov.eq(_rightNode(5, 9), 6);

  prov.eq(_rightNode(6, 7), undefined);

  prov.eq(_rightNode(7, 8), undefined);
  prov.eq(_rightNode(7, 9), 8);
  prov.eq(_rightNode(7, 10), 9);
  prov.eq(_rightNode(7, 11), 9);
  prov.eq(_rightNode(7, 12), 11);
  prov.eq(_rightNode(7, 13), 11);
  prov.eq(_rightNode(7, 14), 11);
  prov.eq(_rightNode(7, 15), 11);
  prov.eq(_rightNode(7, 16), 11);
  prov.eq(_rightNode(7, 17), 11);
  prov.eq(_rightNode(7, 18), 11);
};
