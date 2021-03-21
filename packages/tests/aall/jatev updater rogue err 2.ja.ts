import { TestProvision } from "^jarun";

import { getRogueUpdater_empty } from "../_fixture";

// rogue before test list

export default (prov: TestProvision) => {
  getRogueUpdater_empty({
    id: "test 1",
    data: { user: { imp: ["rogue"] } },
  });
};
