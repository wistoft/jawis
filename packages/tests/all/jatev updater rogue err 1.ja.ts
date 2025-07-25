import { TestProvision } from "^jarun";

import { getRogueUpdate_with_tests } from "../_fixture";

// rogue before test report

export default (prov: TestProvision) => {
  getRogueUpdate_with_tests({
    id: "test 1",
    data: { user: { imp: ["rogue"] } },
  });
};
