import { sleeping } from "^jab";
import { makeLogServiceToConsole } from "^jab-node";
import { TestProvision } from "^jarun";

//indent is according to largest log-type. (even if is comes after.)

export default (prov: TestProvision) => {
  const logProv = makeLogServiceToConsole("root.", 10);

  logProv.logStream("log1", "hej");
  logProv.logStream("IamLargest", "dav");

  return sleeping(20);
};
