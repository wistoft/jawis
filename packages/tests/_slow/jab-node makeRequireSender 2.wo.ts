import { makeRequireSender, plugIntoModuleLoadOld } from "^jab-node";

import { getScriptPath, logRequireMessage } from "^tests/_fixture";

//no transitive require emitted on subsequent requires.

plugIntoModuleLoadOld(makeRequireSender(logRequireMessage));

require(getScriptPath("helloRequire"));

require(getScriptPath("helloRequire"));
