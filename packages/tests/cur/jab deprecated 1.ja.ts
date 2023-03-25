import { basename, deprecated } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  deprecated_test("a");
  deprecated_test("b");
};

// wrap a function, so it output deprecation warning
const deprecated_test = (str: string) =>
  deprecated("basename is deprecated", [str], basename);
