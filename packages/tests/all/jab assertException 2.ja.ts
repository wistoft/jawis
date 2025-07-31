import { assertException } from "^jab";
import { TestProvision } from "^jarun";

//exception is thrown but does not match

export default (prov: TestProvision) =>
  assertException(
    () => {
      throw new Error("ups");
    },
    (errMsg) => !!errMsg.match(/fido/)
  );
