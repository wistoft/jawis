import { TestProvision } from "^jarun";

import {
  renderUseJagoDirector,
  renderUseJatevDirector,
  renderUseJatevDirector_with_tests,
} from "../_fixture";

//when server has sent list of test

export default (prov: TestProvision) => {
  const { result } = renderUseJatevDirector_with_tests(prov);

  const testCol = result.state.tests;

  prov.imp(testCol?.tests);
  prov.imp(testCol?.flatIds);
};
