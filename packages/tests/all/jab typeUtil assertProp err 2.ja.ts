import { assertProp } from "^jab";
import { TestProvision } from "^jarun";

//it's not an object

export default (prov: TestProvision) => {
  assertProp(null, "dav");
};
