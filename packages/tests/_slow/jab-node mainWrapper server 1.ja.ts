import { TestProvision } from "^jarun";
import { getJabTsProcess_ready, getScriptPath } from "^tests/_fixture";

//doesn't register on shutdown

export default async (prov: TestProvision) =>
  getJabTsProcess_ready(prov, {
    filename: getScriptPath("mainWrapper1"),
  }).then((proc) => proc.shutdown());
