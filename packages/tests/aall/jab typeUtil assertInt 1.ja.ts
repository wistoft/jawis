import { assertInt } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.eq(1, assertInt(1));
  prov.eq(1, assertInt(1.0));
};
