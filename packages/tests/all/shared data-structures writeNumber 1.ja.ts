import { TestProvision } from "^jarun";
import { readNumber, writeNumber } from "^shared-algs/internal";
import { data1 } from "^tests/_fixture";

export default (prov: TestProvision) => {
  writeNumber(data1, 0, 7, 1);
  prov.eq(7, readNumber(data1, 0, 1));

  writeNumber(data1, 0, 7, 2);
  prov.eq(7, readNumber(data1, 0, 2));

  writeNumber(data1, 0, 400, 4);
  prov.eq(400, readNumber(data1, 0, 4));
};
