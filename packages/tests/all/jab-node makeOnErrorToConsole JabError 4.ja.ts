import { JabError } from "^jab";
import { makeOnErrorToConsole } from "^jab-node";
import { TestProvision } from "^jarun";

// info in JabError, that needs cloning.

export default (prov: TestProvision) => {
  const onError = makeOnErrorToConsole();

  onError(new JabError("hello", undefined, Infinity, NaN, []));
};
