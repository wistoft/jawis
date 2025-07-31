import { TestProvision } from "^jarun";

import { assertException } from "^jab";

//exception is thrown and match

export default (prov: TestProvision) =>
  assertException(
    () => {
      throw new Error("ups");
    },
    (errMsg) => !!errMsg.match(/ups/)
  );
