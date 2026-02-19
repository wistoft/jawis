import { webpackCompileHelper } from "./util/build";
import { makeLiveJawisBuildManager } from "./build/util2";

makeLiveJawisBuildManager()
  .build()
  .then(() => {
    webpackCompileHelper("jacs", "JacsConsumerMain");
    webpackCompileHelper("jarun", "JarunProcessMain");
    webpackCompileHelper("jab-node/process", "WatchableProcessMain");
    webpackCompileHelper("jagos", "ScriptWrapperMain");
  })
  .catch(console.log);
