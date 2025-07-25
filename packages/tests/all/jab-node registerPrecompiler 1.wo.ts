import { registerPrecompilers } from "^node-module-hooks-plus";

import { getScriptPath } from "../_fixture";

//returns the code, that the preCompiler decides.

registerPrecompilers(
  [".php"],
  () => "console.log('code from registerPrecompilers')"
);

eval("require.eager || require")(getScriptPath("hello.php"));
