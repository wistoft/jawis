import { makeRequireSender, plugIntoModuleLoadOld } from "^jab-node";

import { logRequireMessage, getScriptPath } from "^tests/_fixture";

plugIntoModuleLoadOld(makeRequireSender(logRequireMessage));

require(getScriptPath("hello"));
require(getScriptPath("helloRequire"));
