import { TestProvision } from "^jarun";
import { getProjectFileSystem, getScriptPath } from "^tests/_fixture/index";

//writing a file with the same content as in cache, will not make any IO.

export default async (prov: TestProvision) => {
  const pfs = getProjectFileSystem(prov);

  const content = await pfs.readFile(getScriptPath("hello.js"));

  await pfs.writeFile(getScriptPath("hello.js"), content);

  await pfs.shutdown();
};
