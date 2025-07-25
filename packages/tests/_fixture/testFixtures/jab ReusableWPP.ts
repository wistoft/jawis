import { BeeDeps } from "^bee-common";
import { TestProvision } from "^jarun";
import { WatchableProcessPreloaderDeps, ReusableWPP } from "^process-util";

import { getJabWatchbleProcessPreloaderDeps } from ".";

export const getReusableWPPAndDeps = (
  prov: TestProvision,
  extraDeps?: Partial<WatchableProcessPreloaderDeps>
): [ReusableWPP<any, any>, WatchableProcessPreloaderDeps & BeeDeps<any>] => {
  const deps = getJabWatchbleProcessPreloaderDeps(prov, extraDeps);

  const ppr = new ReusableWPP(deps);

  return [ppr, deps];
};
