import { TestProvision } from "^jarun";

import { getJarunProcessController, makeDormentInMemoryBee } from "../_fixture";

export default (prov: TestProvision) =>
  getJarunProcessController(prov, {
    makeTsBee: makeDormentInMemoryBee,
  }).kill();
