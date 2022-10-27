import { TestProvision } from "^jarun";

import {
  errorData0,
  renderUseJatevDirector_with_test_results,
} from "../_fixture";

// rogue error

export default (prov: TestProvision) => {
  const { rerender, onServerMessage } =
    renderUseJatevDirector_with_test_results(prov);

  onServerMessage({
    type: "OnRogue",
    data: { id: "test 1", data: { err: [errorData0], user: {} } },
  });

  prov.log(
    "test with previous logs",
    rerender().state.tests?.getTest("test 1")
  );
};
