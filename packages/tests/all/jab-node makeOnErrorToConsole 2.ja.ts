import { makeOnErrorToConsole } from "^jab-node";
import { TestProvision } from "^jarun";

//system error

export default (prov: TestProvision) => {
  const onError = makeOnErrorToConsole();

  try {
    require("dontExist");
  } catch (error) {
    onError(error);
  }
};
