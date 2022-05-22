import { makeJabError, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { filterErrorDataStack } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(filterErrorDataStack(unknownToErrorData(makeJabError("hej"))));
  imp(filterErrorDataStack(unknownToErrorData(makeJabError("dav", []))));
  imp(filterErrorDataStack(unknownToErrorData(makeJabError("ups", undefined))));
};
