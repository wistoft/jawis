import { TestProvision } from "^jarun";
import { getScriptPath } from "^tests/_fixture/index";
import { getTsCompileServiceIncremental } from "^tests/_fixture";

//compile single file

export default async (prov: TestProvision) => {
  const tscs = getTsCompileServiceIncremental(prov);

  const code = await tscs.load(getScriptPath("helloTs.ts"));

  eval(code);
};
