import { assertIntString } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.eq("1", assertIntString("1"));
};
