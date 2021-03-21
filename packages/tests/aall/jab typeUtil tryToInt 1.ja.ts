import { tryToInt } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.eq(1, tryToInt("1"));

  prov.eq(null, tryToInt("1.0"));
  prov.eq(null, tryToInt(""));
};
