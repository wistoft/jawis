import { TestProvision } from "^jarun";

import { makeJabError } from "^jab";
import { filterErrorDataStack } from "../_fixture";

export default ({ imp }: TestProvision) => {
  const err = makeJabError("message", 1, 2);

  imp(filterErrorDataStack(err.getErrorData()));
  imp(filterErrorDataStack(err.getErrorData([3])));
};
