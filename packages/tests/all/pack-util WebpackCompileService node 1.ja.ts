import { TestProvision } from "^jarun";

import {
  evalWebpackOutput,
  getScriptPath,
  getTsProjectPath,
} from "^tests/_fixture";
import { extendOnError, WebpackCompileService } from "^pack-util/internal";

//webpack leaves node-specific things. And doesn't error on them.

export default (prov: TestProvision) => {
  const compileService = new WebpackCompileService({
    compileServiceRoot: getTsProjectPath(),
    sendErrorsAsCode: true,
    globalErrorCatchFix: true,
    config: {
      target: "node",
    },
  });

  return compileService.load(getScriptPath("node-specific.js")).then((data) => {
    evalWebpackOutput(data, extendOnError(prov.onError, prov.onErrorData));
  });
};
