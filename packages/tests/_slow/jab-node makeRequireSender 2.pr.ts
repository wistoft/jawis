import { makeRequireSender, plugIntoModuleLoad } from "^jab-node";

import { getScriptPath, logRequireMessage } from "^tests/_fixture";

plugIntoModuleLoad(makeRequireSender(logRequireMessage));

require(getScriptPath("helloRequire"));

//no transitive require emitted here.

require(getScriptPath("helloRequire"));
