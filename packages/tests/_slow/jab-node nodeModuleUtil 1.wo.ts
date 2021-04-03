import { unRegisterTsCompiler } from "^jacs";
import { registerPrecompiler } from "^jab-node";
import { getScriptPath } from "../_fixture";

//returns exactly the code, that the preCompiler decides.

unRegisterTsCompiler();

registerPrecompiler([".ts"], () => "console.log('this is some new code')");

require(getScriptPath("helloTs.ts"));
