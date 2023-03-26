import { basename, deprecated } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  (global as any)["__jawis_deprecation_warned"] = {}; // so test is repeatable

  deprecated_test("a");
  deprecated_test("b");
};

// wrap a function, so it output deprecation warning
const deprecated_test = (str: string) =>
  deprecated("basename is deprecated", [str], basename);
