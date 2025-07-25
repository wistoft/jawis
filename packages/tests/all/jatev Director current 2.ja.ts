import { TestProvision } from "^jarun";

import { renderUseJatevDirector_with_tests } from "../_fixture";

//freshness

export default (prov: TestProvision) => {
  const { result, rerender } = renderUseJatevDirector_with_tests(prov);

  prov.eq(undefined, result.state.currentTestFressness);

  result.onNext();

  //

  const r1 = rerender();

  const token = r1.state.currentTestFressness;
  prov.eq("test 1", r1.state.currentTest?.id);

  result.onNext();
  result.onPrev();

  //

  const r2 = rerender();

  prov.neq(token, r2.state.currentTestFressness); //token has been change
  prov.eq("test 1", r2.state.currentTest?.id); //test is the same
};
