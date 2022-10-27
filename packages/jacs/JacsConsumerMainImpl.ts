import fs from "fs";
import nativeModule from "module";
import * as tsConfigPaths from "tsconfig-paths";
import sourceMapSupport from "source-map-support";

import { def, ErrorWithParsedNodeStack } from "^jab";
import { CompileFunction, FullNativeModule, nodeRequire } from "^jab-node";

import {
  extractStackTraceInfo,
  unRegisterSourceMapSupport,
  unRegisterTsCompiler,
  WorkerData,
} from ".";
import { JacsConsumer } from "./JacsConsumer";

const Module = nativeModule as unknown as FullNativeModule & {
  prototype: { _compile: CompileFunction; _jacsUninstall?: () => void };
};

export type UninstallInfo = {
  stackTraceLimit: number;
  prepareStackTrace: typeof Error.prepareStackTrace;
  _compile: CompileFunction; //to revert 'hookRequire' in source-map-support
  tsConfigPaths?: () => void;
  consumer?: JacsConsumer;
};

/**
 *
 */
export const install = (shared: WorkerData) => {
  if ((global as any)._jacsUninstall !== undefined) {
    throw new Error("Already installed.");
  }

  //info for uninstall; collected before, they are modified.

  const uninstallInfo: UninstallInfo = {
    stackTraceLimit: Error.stackTraceLimit,
    prepareStackTrace: Error.prepareStackTrace,
    _compile: Module.prototype._compile,
  };

  //unregister - for development

  if (shared.unregister) {
    //this should be done elsewhere. Because we don't know which compiler to uninstall.
    unRegisterTsCompiler();
  }

  //A better default, because it will give all information.

  Error.stackTraceLimit = shared.stackTraceLimit || Infinity;

  //setup ts paths

  if (shared.tsPaths) {
    if (!fs.existsSync(shared.tsPaths.baseUrl)) {
      throw new Error("BaseUrl must exist: " + shared.tsPaths.baseUrl);
    }

    uninstallInfo.tsConfigPaths = tsConfigPaths.register(shared.tsPaths);
  }

  //install source map

  sourceMapSupport.install({
    handleUncaughtExceptions: false,
    environment: "node",
    hookRequire: true,
  });

  //replace source-map-support's prepareStackTrace - to get more information.

  Error.prepareStackTrace = (
    error: ErrorWithParsedNodeStack,
    stackTraces: NodeJS.CallSite[]
  ) => {
    const { stack, fullInfo } = extractStackTraceInfo(error, stackTraces);

    error.__jawisNodeStack = fullInfo;

    return stack;
  };

  //setup jacs

  const onError = (error: unknown) => {
    console.log("JacsConsumer.onError: ", error);
  };

  const consumer = new JacsConsumer({
    shared,
    onError,
  });

  consumer.register();

  uninstallInfo.consumer = consumer;

  //store uninstall function

  (global as any)._jacsUninstall = makeUninstall(uninstallInfo);

  //run the script

  if (shared.beeFilename) {
    nodeRequire(shared.beeFilename);
  }

  // return

  return consumer;
};

/**
 * - Uninstall can't be perfect. But can useful for development testing.
 * - Uninstall information is stored globally, so other versions can uninstall.
 *
 * impl
 *  tsconfig-paths and resovleCache both change `Module._resolveFilename`, so order is important.
 *
 * bugs
 *  - source-map-support has no official uninstall.
 */
export const uninstall = () => {
  if ((global as any)._jacsUninstall === undefined) {
    throw new Error("Not installed.");
  }

  (global as any)._jacsUninstall();

  delete (global as any)._jacsUninstall;
};

/**
 *
 */
const makeUninstall = (uninstallInfo: UninstallInfo) => () => {
  def(uninstallInfo.consumer).unregister();

  unRegisterSourceMapSupport(uninstallInfo);

  if (uninstallInfo.tsConfigPaths) {
    uninstallInfo.tsConfigPaths();
  }

  Error.stackTraceLimit = uninstallInfo.stackTraceLimit;
};
