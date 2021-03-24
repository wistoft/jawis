import { makeOnErrorToConsole } from "^jab-node";
import { TestProvision } from "^jarun";

//registers on shutdown

export default async (prov: TestProvision) => {
  const onError = makeOnErrorToConsole();

  onError("dummy error");
  onError(new Error("hello"));
  onError(new Error("there's more"), ["here it is"]);
};
