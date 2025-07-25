import { WebpackCompileService } from "^pack-util";

/**
 *
 */
export const makeWebpackCompileService = async (serviceConfig: any) => {
  const projectRoot = serviceConfig["@jawis/javi/projectRoot"];

  return new WebpackCompileService({
    compileServiceRoot: projectRoot,
    sendErrorsAsCode: true,
    globalErrorCatchFix: true,
  });
};
