import { JabError } from "^jab";
import { makeOnErrorToConsole } from "^jab-node";
import { TestProvision } from "^jarun";
import { getErrorForPrint } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const onError = makeOnErrorToConsole();

  onError(getErrorForPrint(new JabError("hello")), ["only info in onError "]);
};
