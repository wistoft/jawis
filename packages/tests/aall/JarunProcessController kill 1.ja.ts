import { TestProvision } from "^jarun";

import { getJarunProcessController, makeDormentInMemoryBee } from "../_fixture";

//kill while starting

export default (prov: TestProvision) =>
  getJarunProcessController(prov, {
    makeTsBee: makeDormentInMemoryBee,
  }).noisyKill();
