import { registerPrecompilers } from "^jab-node";

import { getScriptPath } from "../_fixture/testFixtures/diverse";

//returns the code, that the preCompiler decides.

registerPrecompilers([".ps1"], () => "console.log('this is some new code')");

eval("require.eager || require")(getScriptPath("hello.ps1"));
