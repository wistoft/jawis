import { TestProvision } from "^jarun";

import { renderUseJatevDirector_with_tests } from "../_fixture";

export default (prov: TestProvision) => {
  const { result, rerender } = renderUseJatevDirector_with_tests(prov);

  result.onNext();

  const r1 = rerender();

  prov.imp(r1.state.currentTest);
  prov.imp(r1.state.currentTestFressness);
};
