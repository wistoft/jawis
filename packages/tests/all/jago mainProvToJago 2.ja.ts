import { makeMainBeeProv } from "^bee-common";
import { TestProvision } from "^jarun";
import { makeJagoSend } from "^tests/_fixture";

//stream has prefix

export default async (prov: TestProvision) => {
  const mainProv = makeMainBeeProv(makeJagoSend(prov), "prefix.");

  mainProv.logStream("the name", "hello");
};
