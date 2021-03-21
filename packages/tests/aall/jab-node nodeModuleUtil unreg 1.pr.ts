import { unRegisterTsCompiler } from "^jacs";

import { getScriptPath } from "^tests/_fixture";

unRegisterTsCompiler();

//can't compile, when "outer" compiler is unregistered.

//undone - at some point this worked?

try {
  require(getScriptPath("helloTs.ts"));
} catch (e) {
  console.log(e.toString());
}
//
