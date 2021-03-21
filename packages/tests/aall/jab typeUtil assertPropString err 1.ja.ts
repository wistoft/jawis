import { assertPropString } from "^jab";
import { TestProvision } from "^jarun";

//doesn't exist

export default (prov: TestProvision) => {
  assertPropString({}, "dav");
};
