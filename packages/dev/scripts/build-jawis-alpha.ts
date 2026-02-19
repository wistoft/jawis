import { webpackCompileHelper } from "./util/build";
import { makeJawisBuildManager } from "./build/build-functions";

import {
  projectRoot,
  alphaBuildFolder,
  npmScope,
  scopedPackages,
  unscopedPackages,
  privatePackages,
} from "../project.conf";

makeJawisBuildManager(
  projectRoot,
  alphaBuildFolder,
  npmScope,
  scopedPackages,
  unscopedPackages,
  privatePackages,
  /* replacePathForRelease */ false,
  []
)
  .build()
  .then(() => {
    webpackCompileHelper("jacs", "JacsConsumerMain", alphaBuildFolder); // prettier-ignore
    webpackCompileHelper("jarun", "JarunProcessMain", alphaBuildFolder);
    webpackCompileHelper("jab-node/process", "WatchableProcessMain", alphaBuildFolder); // prettier-ignore
    webpackCompileHelper("jagos", "ScriptWrapperMain", alphaBuildFolder);
  })
  .catch(console.log);
