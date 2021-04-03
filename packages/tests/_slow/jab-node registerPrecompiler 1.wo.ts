import { unRegisterTsCompiler } from "^jacs";
import { registerPrecompilers } from "^jab-node";
import { getScriptPath } from "../_fixture";

//returns exactly the code, that the preCompiler decides.

unRegisterTsCompiler();

registerPrecompilers([".ts"], () => "console.log('this is some new code')");

require(getScriptPath("helloTs.ts"));
