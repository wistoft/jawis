import { TestProvision } from "^jarun";

import { getRogueUpdate_empty } from "../_fixture";

// rogue before test list

export default (prov: TestProvision) => {
  getRogueUpdate_empty({
    id: "test 1",
    data: { user: { imp: ["rogue"] } },
  });
};
