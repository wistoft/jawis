import { TestProvision } from "^jarun";

import {
  evalWebpackOutput,
  getScriptPath,
  getTsProjectPath,
} from "^tests/_fixture";
import { extendOnError, WebpackCompileService } from "^pack-util/internal";

//file throws, when executed

export default (prov: TestProvision) => {
  const compileService = new WebpackCompileService({
    compileServiceRoot: getTsProjectPath(),
    sendErrorsAsCode: true,
    globalErrorCatchFix: true,
  });

  return compileService.load(getScriptPath("throw.js")).then((data) => {
    evalWebpackOutput(data, extendOnError(prov.onError, prov.onErrorData));
  });
};
