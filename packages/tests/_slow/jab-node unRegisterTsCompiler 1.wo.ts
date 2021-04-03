import { unRegisterTsCompiler } from "^jacs";

import { getScriptPath } from "^tests/_fixture";

//can't compile, when "outer" compiler is unregistered.

unRegisterTsCompiler();

try {
  require(getScriptPath("helloTs.ts"));
} catch (e) {
  console.log(e.toString());
}
//
