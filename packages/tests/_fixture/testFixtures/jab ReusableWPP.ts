import { TestProvision } from "^jarun";
import {
  ProcessDeps,
  WatchableProcessPreloaderDeps,
  ReusableWPP,
} from "^jab-node";

import { getJabWatchbleProcessPreloaderDeps } from ".";

export const getReusableWPPAndDeps = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps>
): [
  ReusableWPP<any, any>,
  WatchableProcessPreloaderDeps & ProcessDeps<any>
] => {
  const deps = getJabWatchbleProcessPreloaderDeps(prov, extraDeps);

  const ppr = new ReusableWPP(deps);

  return [ppr, deps];
};
