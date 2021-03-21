import { assertPropString } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.eq("hej", assertPropString({ dav: "hej" }, "dav"));
};
