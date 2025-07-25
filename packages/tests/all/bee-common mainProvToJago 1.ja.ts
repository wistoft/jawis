import { makeMainBeeProv } from "^bee-common";
import { TestProvision } from "^jarun";
import { makeSendLog } from "^tests/_fixture";

export default async (prov: TestProvision) => {
  const mainProv = makeMainBeeProv(makeSendLog(prov));

  mainProv.onError(new Error("hello"));
  mainProv.onError(new Error("there's more"), ["here it is"]);

  mainProv.log("hello", "there", undefined);
};
