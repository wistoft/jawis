import { webpackCompileHelper } from "./util/build";

const { alphaBuildFolder } = eval("require")("../../../project.conf");

webpackCompileHelper("jacs", "JacsConsumerMain", alphaBuildFolder); // prettier-ignore
webpackCompileHelper("jarun", "JarunProcessMain", alphaBuildFolder);
webpackCompileHelper("jab-node/process", "WatchableProcessMain", alphaBuildFolder); // prettier-ignore
webpackCompileHelper("jagos", "ScriptWrapperMain", alphaBuildFolder);
