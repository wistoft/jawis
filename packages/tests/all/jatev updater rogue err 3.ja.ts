import { TestProvision } from "^jarun";

import { getRogueUpdater_with_tests } from "../_fixture";

// rogue data for unknown test case

export default (prov: TestProvision) => {
  prov.imp(
    getRogueUpdater_with_tests({
      id: "dontExist",
      data: { user: { imp: ["rogue"] } },
    })
  );
};
