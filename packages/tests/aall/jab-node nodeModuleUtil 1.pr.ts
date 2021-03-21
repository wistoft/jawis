import { unRegisterTsCompiler } from "^jacs";
import { registerPrecompiler } from "^jab-node";
import { getScriptPath } from "../_fixture";

unRegisterTsCompiler();

//returns exactly the code, that the preCompiler decides.

registerPrecompiler([".ts"], () => {
  return "console.log('this is some new code')";
});

require(getScriptPath("helloTs.ts"));
