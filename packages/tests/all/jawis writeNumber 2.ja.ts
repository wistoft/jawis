import { readNumber, writeNumber } from "^jab-node";
import { TestProvision } from "^jarun";

//handle Uint16Array

export default (prov: TestProvision) => {
  const a = new Uint16Array(10) as any;

  writeNumber(a, 0, 7, 1);
  prov.eq(7, readNumber(a, 0, 1));

  writeNumber(a, 0, 7, 2);
  prov.eq(7, readNumber(a, 0, 2));

  writeNumber(a, 0, 400, 4);
  prov.eq(400, readNumber(a, 0, 4));
};
