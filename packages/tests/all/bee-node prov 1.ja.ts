import { TestProvision } from "^jarun";
import { AbsoluteFile } from "^jab";
import { getBeeProv } from "^bee-node/bee-node";

import { runLiveJacsBee_lazy } from "../_fixture/index";

export default (prov: TestProvision) =>
  runLiveJacsBee_lazy(prov, __filename as AbsoluteFile);

export const main = () => {
  const beeProv = getBeeProv("testChannelToken", true);

  beeProv.beeSend("bee post");

  beeProv.sendLog({
    type: "log",
    data: ["log string"],
  });
};
