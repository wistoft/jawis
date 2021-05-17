import { makeOnErrorToConsole } from "^jab-node";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  const onError = makeOnErrorToConsole();

  onError("dummy error");
};
