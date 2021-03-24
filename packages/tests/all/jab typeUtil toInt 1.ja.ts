import { toInt } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.eq(1, toInt("1"));
  prov.eq(0, toInt("0"));
};
