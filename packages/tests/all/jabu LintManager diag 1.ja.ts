import { TestProvision } from "^jarun";
import { getLintManager, getScriptPath } from "^tests/_fixture/index";

//gather diagnostics from plugins

export default async (prov: TestProvision) => {
  const diags = [{ message: "some error", line: 1, column: 1 }];

  const manager = getLintManager(prov, {
    plugins: [
      () => ({
        includeFile: () => true,
        getDiagnostics: () => diags,
      }),
    ],
  });

  prov.res(diags, manager.getDiagnostics(getScriptPath("hello.js")));
};
