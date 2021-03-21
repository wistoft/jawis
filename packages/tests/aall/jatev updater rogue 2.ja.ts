import { TestProvision } from "^jarun";
import { makeRogueUpdater } from "^jatev/updaters";

import {
  getRogueUpdater_with_test_reports,
  makeGetRandomInteger,
  defaultState,
} from "../_fixture";

//return log

export default (prov: TestProvision) => {
  //

  const state = getRogueUpdater_with_test_reports({
    id: "test 1",
    data: { return: "hello ret", user: {} },
  });

  prov.log("test that has no test logs", state);

  //rogue return log again (reusing state)

  const state2 = makeRogueUpdater(
    {
      id: "test 1",
      data: { return: "return again", user: {} },
    },
    makeGetRandomInteger()
  )({ ...defaultState, ...state });

  prov.log("test that has same test logs", state2);
};
