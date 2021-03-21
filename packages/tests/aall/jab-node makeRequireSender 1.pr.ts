import { makeRequireSender, plugIntoModuleLoad } from "^jab-node";

import { logRequireMessage, getScriptPath } from "^tests/_fixture";

plugIntoModuleLoad(makeRequireSender(logRequireMessage));

require(getScriptPath("hello"));
require(getScriptPath("helloRequire"));
