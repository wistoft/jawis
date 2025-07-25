import { TestProvision } from "^jarun";
import { filterAbsoluteFilesInStdout, getManager } from "^tests/_fixture/index";

//get diags from all files

export default async (prov: TestProvision) => {
  const manager = getManager(prov, {
    diagnostics: true,
    subManagers: [
      () => ({
        includeFile: (file) => file.includes("hello.js"),
        getDiagnostics: () => [{ message: "some error", line: 1, column: 1 }],
      }),
    ],
  });

  filterAbsoluteFilesInStdout(prov);

  await manager.start();

  return manager.shutdown();
};
