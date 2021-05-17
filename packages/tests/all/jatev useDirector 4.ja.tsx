import { TestProvision } from "^jarun";

import { renderUseJatevDirector } from "../_fixture";

//filter empty levels, because the server can send them.

export default (prov: TestProvision) => {
  const { result, rerender } = renderUseJatevDirector(prov);

  result.callbacks.setTestSelection([[]]);

  prov.eq([], rerender().state.tests?.tests);
};
