import { nodepackHelper, webpackHelper } from "./util/build";

nodepackHelper("jacs", "JacsConsumerMain");
nodepackHelper("jarun", "JarunProcessMain");
nodepackHelper("jab-node/process", "WatchableProcessMain");
nodepackHelper("jagos", "ScriptWrapperMain");

webpackHelper("jagov", "ymer");
webpackHelper("console", "consoleCaptureMain");
