import { JabError, unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { filterErrorDataStack } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(filterErrorDataStack(unknownToErrorData(new JabError("hej"))));
  imp(filterErrorDataStack(unknownToErrorData(new JabError("dav", []))));
  imp(filterErrorDataStack(unknownToErrorData(new JabError("ups", undefined))));
};
