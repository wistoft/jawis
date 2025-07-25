import { makeMainBeeProv } from "^bee-common";
import { TestProvision } from "^jarun";
import { makeSendLog } from "^tests/_fixture";

//stream has prefix

export default async (prov: TestProvision) => {
  const mainProv = makeMainBeeProv(makeSendLog(prov), "prefix.");

  mainProv.logStream("the name", "hello");
};
