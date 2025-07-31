import { assertException } from "^jab";
import { TestProvision } from "^jarun";

//exception is not thrown

export default (prov: TestProvision) =>
  assertException(
    () => {},
    () => true
  );
