import { unRegisterTsCompiler } from "^jacs";
import { registerPrecompilers } from "^jab-node";
import { getScriptPath } from "../_fixture/testFixtures/diverse";

//returns exactly the code, that the preCompiler decides.

unRegisterTsCompiler();

registerPrecompilers([".ts"], () => "console.log('this is some new code')");

require(getScriptPath("helloTs.ts"));
