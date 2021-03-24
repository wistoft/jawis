import { assertProp } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.eq("hej", assertProp({ dav: "hej" }, "dav"));
};
