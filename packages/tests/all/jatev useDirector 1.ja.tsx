import { TestProvision } from "^jarun";

import { renderUseJatevDirector } from "../_fixture";

//when no information has come from server

export default (prov: TestProvision) => {
  const { result } = renderUseJatevDirector(prov);

  const testCol = result.state.tests;

  prov.eq(undefined, testCol?.tests);
  prov.eq(undefined, testCol?.flatIds);
};
