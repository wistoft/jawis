import { sleeping } from "^yapu";
import { makeLogServiceToConsole } from "^main-wrapper";
import { TestProvision } from "^jarun";

//intermixed is separated

export default (prov: TestProvision) => {
  const logProv = makeLogServiceToConsole("root.", 10);

  logProv.logStream("log1", "A\nB");
  logProv.logStream("log2", "dav");
  logProv.logStream("log1", "C");

  return sleeping(20);
};
