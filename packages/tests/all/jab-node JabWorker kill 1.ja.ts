import { TestProvision } from "^jarun";
import { getJabWorker, getScriptPath } from "../_fixture";

//kill worker right away

export default (prov: TestProvision) =>
  getJabWorker(prov, {
    filename: getScriptPath("silent.js"),
  }).kill();
//
