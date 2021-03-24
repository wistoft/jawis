import { isInt } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.chk(isInt(1));
  prov.chk(isInt(1.0));
  prov.chk(isInt(3 / 3));

  prov.chk(!isInt({}));
  prov.chk(!isInt(1.1));
  prov.chk(!isInt(Infinity));
  prov.chk(!isInt(NaN));

  prov.chk(!isInt("1"));
  prov.chk(!isInt("1.0"));
};
