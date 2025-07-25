import { TestProvision } from "^jarun";

import { getRogueUpdate_with_tests } from "../_fixture";

// rogue data for unknown test case

export default (prov: TestProvision) => {
  prov.imp(
    getRogueUpdate_with_tests({
      id: "dontExist",
      data: { user: { imp: ["rogue"] } },
    })
  );
};
