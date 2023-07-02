import { sleeping } from "^yapu";
import { makeLogServiceToConsole } from "^main-wrapper";
import { TestProvision } from "^jarun";

//log several times

export default async (prov: TestProvision) => {
  const logProv = makeLogServiceToConsole("root.", 10);

  logProv.logStream("log1", "hej");
  logProv.logStream("log2", "dav");

  await sleeping(20);

  logProv.logStream("log1", "igen");

  await sleeping(20);
};
