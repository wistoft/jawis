import { hasProp } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.chk(hasProp({ dav: 1 }, "dav"));

  prov.chk(!hasProp({}, "dav"));
  prov.chk(!hasProp("1", "dav"));
  prov.chk(!hasProp(undefined, "dav"));
  prov.chk(!hasProp(null, "dav"));
};
