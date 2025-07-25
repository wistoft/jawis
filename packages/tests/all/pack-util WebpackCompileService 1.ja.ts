import { TestProvision } from "^jarun";

import { evalWebpackOutput, getTsProjectPath } from "^tests/_fixture";
import { extendOnError, WebpackCompileService } from "^pack-util/internal";

export default (prov: TestProvision) => {
  const compileService = new WebpackCompileService({
    compileServiceRoot: getTsProjectPath(),
    sendErrorsAsCode: true,
    globalErrorCatchFix: true,
  });

  return compileService.load(getTsProjectPath("hello.ts")).then((data) => {
    evalWebpackOutput(data, extendOnError(prov.onError, prov.onErrorData));
  });
};
