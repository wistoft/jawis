import fs from "node:fs";
import * as tsConfigPaths from "tsconfig-paths";
import sourceMapSupport from "source-map-support";

import { def, ErrorWithParsedNodeStack, MainFileDeclaration } from "^jab";
import { interceptResolve } from "^node-module-hooks-plus";
import { getBeeProv } from "^bee-node";
import { makeMakeCachedResolve } from "^cached-resolve";

import { extractStackTraceInfo, WorkerData, JacsConsumer } from "./internal";

export const jacsConsumerMainDeclaration: MainFileDeclaration = {
  type: "node-bee",
  file: "JacsConsumerMain",
  folder: __dirname,
};

export type UninstallInfo = {
  resolveCache?: () => void;
  stackTraceLimit: number;
  prepareStackTrace: typeof Error.prepareStackTrace;
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
  };

  //A better default, because it will give all information.

  Error.stackTraceLimit = shared.stackTraceLimit || Infinity;

  //setup ts paths

  if (shared.tsPaths) {
    if (!fs.existsSync(shared.tsPaths.baseUrl)) {
      throw new Error("BaseUrl must exist: " + shared.tsPaths.baseUrl);
    }

    uninstallInfo.tsConfigPaths = tsConfigPaths.register(shared.tsPaths);
  }

  //Resolve cache
  // Must come after ts-paths, its work can be cached as well.

  if (shared.resolveCache) {
    uninstallInfo.resolveCache = interceptResolve(
      makeMakeCachedResolve(shared.resolveCache)
    );
  }

  //install source map

  if (shared.doSourceMap) {
    sourceMapSupport.install({
      handleUncaughtExceptions: false,
      environment: "node",
      retrieveFile: (path) => retrieveFile(consumer, path),
    });
  }

  //replace source-map-support's prepareStackTrace - to get more information.

  Error.prepareStackTrace = (
    error: ErrorWithParsedNodeStack,
    stackTraces: NodeJS.CallSite[]
  ) => {
    const { stack, fullInfo } = extractStackTraceInfo(
      error,
      stackTraces,
      shared.doSourceMap
    );

    error.__jawisNodeStack = fullInfo;

    return stack;
  };

  // bee provision

  const beeProv = getBeeProv(shared.channelToken, false);

  //setup jacs

  const consumer = new JacsConsumer({
    shared,
    onError: beeProv.onError,
  });

  consumer.register();

  uninstallInfo.consumer = consumer;

  //store uninstall function

  (global as any)._jacsUninstall = makeUninstall(uninstallInfo);

  //run the script
  //  catch errors to avoid unhandled rejection noise.

  beeProv.runBee(shared.next, true).catch(beeProv.onError);

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

  if (uninstallInfo.resolveCache) {
    uninstallInfo.resolveCache();
  }

  if (uninstallInfo.tsConfigPaths) {
    uninstallInfo.tsConfigPaths();
  }

  Error.stackTraceLimit = uninstallInfo.stackTraceLimit;
};

/**
 * Deliver generated source code to source-map-support
 *
 * source-map-support has an option, that does the same: hookRequire:true
 *  but it can't be compiled with webpack, because source-map-support's dynamicRequire fix doesn't work.
 */
const retrieveFile = (consumer: JacsConsumer, path: string): string | null => {
  const res = consumer.getCachedCode(path);

  return res ? res : null;
};
