import { TestProvision } from "^jarun";
import { WatchableProcessPreloaderDeps, ReusableWPP } from "^jab-node";

import { getJabWatchbleProcessPreloaderDeps } from ".";
import { BeeDeps } from "^jabc";

export const getReusableWPPAndDeps = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps>
): [ReusableWPP<any, any>, WatchableProcessPreloaderDeps & BeeDeps<any>] => {
  const deps = getJabWatchbleProcessPreloaderDeps(prov, extraDeps);

  const ppr = new ReusableWPP(deps);

  return [ppr, deps];
};
