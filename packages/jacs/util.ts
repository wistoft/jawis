import nativeModule from "module";
import { nodeRequire } from "^jab-node";
import { UninstallInfo } from "^jacs";

/**
 * This is hacky
 *
 */
export const unRegisterTsCompiler = () => {
  delete nodeRequire.extensions[".ts"];
  delete nodeRequire.extensions[".tsx"];
};

/**
 * This is hacky
 *
 * bug
 *  - Error.prepareStackTrace wont be reinstalled by source-map-support. But happily, jacs has its own.
 */
export const unRegisterSourceMapSupport = (uninstallInfo: UninstallInfo) => {
  (nativeModule.prototype as any)._compile = uninstallInfo._compile;
  Error.prepareStackTrace = uninstallInfo.prepareStackTrace;
};
