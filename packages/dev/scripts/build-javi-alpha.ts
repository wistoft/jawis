import { webpackCompileHelper } from "./util/build";

import { alphaBuildFolder } from "^config/project.conf";

webpackCompileHelper("jacs", "JacsConsumerMain", alphaBuildFolder); // prettier-ignore
webpackCompileHelper("jarun", "JarunProcessMain", alphaBuildFolder);
webpackCompileHelper("jab-node/process", "WatchableProcessMain", alphaBuildFolder); // prettier-ignore
webpackCompileHelper("jagos", "ScriptWrapperMain", alphaBuildFolder);
