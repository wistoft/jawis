import { mainProvToJago } from "^jab-node";
import { TestProvision } from "^jarun";
import { makeJagoSend } from "^tests/_fixture";

//stream has prefix

export default async (prov: TestProvision) => {
  const mainProv = mainProvToJago(makeJagoSend(prov), "prefix.");

  mainProv.logStream("the name", "hello");
};
