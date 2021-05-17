import { JabError } from "^jab";
import { makeOnErrorToConsole } from "^jab-node";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  const onError = makeOnErrorToConsole();

  onError(new JabError("hello"), ["only info in onError "]);
};
