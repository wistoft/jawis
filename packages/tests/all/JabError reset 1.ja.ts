import { TestProvision } from "^jarun";

import { makeJabError } from "^jab";
import { filterErrorDataStack } from "../_fixture";

export default ({ imp }: TestProvision) => {
  const err = makeJabError("message", 1, 2);

  err.reset("new message", "new info");

  imp(err);
  imp(filterErrorDataStack(err.getErrorData()));
};
