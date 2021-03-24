import { assertPropString } from "^jab";
import { TestProvision } from "^jarun";

//not a string

export default (prov: TestProvision) => {
  assertPropString({ dav: 1 }, "dav");
};
