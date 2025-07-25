import { TestProvision } from "^jarun";
import { getScriptPath } from "^tests/_fixture/index";
import { getTsCompileServiceNonIncremental } from "^tests/_fixture";

//compile single file

export default async (prov: TestProvision) => {
  const tscs = getTsCompileServiceNonIncremental(prov);

  const code = await tscs.load(getScriptPath("helloTs.ts"));

  eval(code);
};
