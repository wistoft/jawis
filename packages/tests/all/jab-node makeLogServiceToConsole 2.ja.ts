import { sleeping } from "^yapu";
import { makeLogServiceToConsole } from "^main-wrapper";
import { TestProvision } from "^jarun";

//indent is according to largest log-type. (even if is comes after.)

export default (prov: TestProvision) => {
  const logProv = makeLogServiceToConsole("root.", 10);

  logProv.logStream("nothing", "");
  logProv.logStream("log1", "hej");
  logProv.logStream("IamLargest", "dav");

  return sleeping(20);
};
