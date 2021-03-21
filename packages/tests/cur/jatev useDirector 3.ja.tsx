import { TestProvision } from "^jarun";

import {
  renderUseJagoDirector,
  renderUseJatevDirector,
  renderUseJatevDirector_with_tests,
  renderUseJatevDirector_with_test_results,
} from "../_fixture";

//when server has sent test results

export default (prov: TestProvision) => {
  const { result } = renderUseJatevDirector_with_test_results(prov);

  const testCol = result.state.tests;

  prov.imp(testCol?.tests);
  prov.imp(testCol?.flatIds);
};
