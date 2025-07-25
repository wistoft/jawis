import { TestProvision } from "^jarun";

import { evalWebpackOutput, getTsProjectPath } from "^tests/_fixture";
import { extendOnError, WebpackCompileService } from "^pack-util/internal";

//file doesn't exist

export default (prov: TestProvision) => {
  const compileService = new WebpackCompileService({
    compileServiceRoot: getTsProjectPath(),
    sendErrorsAsCode: true,
    globalErrorCatchFix: true,
  });

  return compileService.load(getTsProjectPath("dontExists")).then((data) => {
    evalWebpackOutput(
      data,
      extendOnError(prov.onError, (error) => {
        prov.chk(error.msg.includes("Module not found"));
      })
    );
  });
};
