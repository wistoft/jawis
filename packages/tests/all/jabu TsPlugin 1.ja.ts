import { TestProvision } from "^jarun";
import { getScriptPath } from "^tests/_fixture/index";
import { getTsPlugin } from "^tests/_fixture";

//single file

export default async (prov: TestProvision) => {
  const { manager } = getTsPlugin(prov, getScriptPath());

  prov.eq([], manager.getDiagnostics(getScriptPath("helloTs.ts")));
};
