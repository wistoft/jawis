import { clone } from "^jab";
import { TestProvision } from "^jarun";
import { ThrowInToString } from "^tests/_fixture";

// some rudeness. Maybe we should be robust an clone anyway.

export default (prov: TestProvision) => {
  prov.imp(clone(new ThrowInToString()));
};
