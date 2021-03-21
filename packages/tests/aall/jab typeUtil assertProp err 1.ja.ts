import { assertProp } from "^jab";
import { TestProvision } from "^jarun";

//property doesn't not exist

export default (prov: TestProvision) => {
  assertProp({}, "dav");
};
