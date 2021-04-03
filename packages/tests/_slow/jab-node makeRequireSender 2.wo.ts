import { makeRequireSender, plugIntoModuleLoad } from "^jab-node";

import { getScriptPath, logRequireMessage } from "^tests/_fixture";

//no transitive require emitted on subsequent requires.

plugIntoModuleLoad(makeRequireSender(logRequireMessage));

require(getScriptPath("helloRequire"));

require(getScriptPath("helloRequire"));
