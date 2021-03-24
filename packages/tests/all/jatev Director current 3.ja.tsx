import { TestProvision } from "^jarun";

import { renderUseJatevDirector_with_tests } from "../_fixture";

//show prev, when nothing shown.

export default (prov: TestProvision) => {
  const { result, rerender } = renderUseJatevDirector_with_tests(prov);

  result.callbacks.onPrev();

  const r1 = rerender();

  prov.imp(r1.state.currentTest);
  prov.imp(r1.state.currentTestFressness);
};
