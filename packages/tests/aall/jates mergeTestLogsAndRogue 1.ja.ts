import { TestProvision } from "^jarun";

import { mergeTestLogsAndRogue } from "^jatec";

// user log

export default ({ eq, log }: TestProvision) => {
  //empty current

  eq([], mergeTestLogsAndRogue([], { user: {} }));
  eq([], mergeTestLogsAndRogue([], { user: { imp: undefined as any } }));

  log(
    "no current, and rogue user log",
    mergeTestLogsAndRogue([], { user: { imp: ["rogue"] } })
  );

  // some current

  const rogueData = mergeTestLogsAndRogue(
    [{ type: "user", name: "imp", exp: ["expectation"], cur: [] }],
    { user: { imp: ["rogue"] } }
  );

  log("current of same type, and rogue user log", rogueData);

  //repeat

  log(
    "current rogue of same type, and rogue user log",
    mergeTestLogsAndRogue(rogueData, { user: { imp: ["again"] } })
  );
};
