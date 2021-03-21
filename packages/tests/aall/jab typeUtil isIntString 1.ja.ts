import { isIntString } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.chk(isIntString("1"));

  prov.chk(!isIntString(" 1"));
  prov.chk(!isIntString("1.0"));
  prov.chk(!isIntString(1));
  prov.chk(!isIntString(1.0));
  prov.chk(!isIntString(3 / 3));
  prov.chk(!isIntString({}));
  prov.chk(!isIntString(1.1));
  prov.chk(!isIntString(Infinity));
  prov.chk(!isIntString(NaN));
};
