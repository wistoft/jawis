import { TestProvision } from "^jarun";
import { getProjectFileSystem, getScriptPath } from "^tests/_fixture/index";

//reading a file twice gives only one IO.

export default async (prov: TestProvision) => {
  const pfs = getProjectFileSystem(prov);

  await pfs.readFile(getScriptPath("hello.js"));
  await pfs.readFile(getScriptPath("hello.js"));

  await pfs.shutdown();
};
