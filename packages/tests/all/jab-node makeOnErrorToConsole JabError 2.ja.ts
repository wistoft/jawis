import { makeJabError } from "^jab";
import { onError } from "^main-wrapper";
import { TestProvision } from "^jarun";
import { getErrorForPrint } from "^tests/_fixture";

export default (prov: TestProvision) => {
  onError(getErrorForPrint(makeJabError("hello")), ["only info in onError "]);
};
