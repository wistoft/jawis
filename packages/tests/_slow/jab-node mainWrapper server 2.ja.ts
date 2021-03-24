import { TestProvision } from "^jarun";
import { getJabTsProcess_ready, getScriptPath } from "^tests/_fixture";

//registers on shutdown

export default async (prov: TestProvision) =>
  getJabTsProcess_ready(prov, {
    filename: getScriptPath("mainWrapper2"),
  }).then((proc) => proc.shutdown());
