import { nodepackHelper, webpackHelper } from "./util/build";

const { alphaBuildFolder } = eval("require")("../../../project.conf");

nodepackHelper("jacs", "JacsConsumerMain", alphaBuildFolder); // prettier-ignore
nodepackHelper("jarun", "JarunProcessMain", alphaBuildFolder);
nodepackHelper("jab-node/process", "WatchableProcessMain", alphaBuildFolder); // prettier-ignore
nodepackHelper("jagos", "ScriptWrapperMain", alphaBuildFolder);

webpackHelper("jagov", "ymer", alphaBuildFolder);
webpackHelper("console", "consoleCaptureMain", alphaBuildFolder);
