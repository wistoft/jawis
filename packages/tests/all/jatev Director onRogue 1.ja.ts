import { TestProvision } from "^jarun";

import { renderUseJatevDirector_with_tests } from "../_fixture";

// rogue data from unknown test.

export default (prov: TestProvision) => {
  const { rerender, onServerMessage } = renderUseJatevDirector_with_tests(prov);

  onServerMessage({
    type: "OnRogue",
    data: { data: { user: { blabla: ["rogue"] } } },
  });

  onServerMessage({
    type: "OnRogue",
    data: { data: { user: { blabla: ["again"] } } },
  });

  prov.imp(rerender().state.unknownRogue);
};
