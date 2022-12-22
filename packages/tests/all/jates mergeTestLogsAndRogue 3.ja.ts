import { TestProvision } from "^jarun";

import { mergeTestLogsAndRogue } from "^jatec";
import { errorData0 } from "../_fixture";

// chk log

export default ({ log }: TestProvision) => {
  log(
    "no current, and rogue chk log",

    mergeTestLogsAndRogue([], {
      chk: { exp: 1, cur: 1, stack: errorData0.stack },
      user: {},
    })
  );

  //the current is not overwritten.

  log(
    "current of same type, and rogue chk log",
    mergeTestLogsAndRogue(
      [
        {
          type: "chk",
          name: "chk",
          exp: 1,
          cur: 1,
          stack: errorData0.stack,
        },
      ],
      {
        chk: { exp: "rogue", cur: "rogue", stack: errorData0.stack },
        user: {},
      }
    )
  );

  //we have to drop it 'silently', because chk log can't have multiple entries.

  log(
    "current rogue of same type, and rogue chk log",
    mergeTestLogsAndRogue(
      [
        {
          type: "chk",
          name: "chk",
          exp: 1,
          cur: 2,
          stack: errorData0.stack,
        },
        {
          type: "chk",
          name: "rogue.chk",
          exp: 1,
          cur: "rogue",
          stack: errorData0.stack,
        },
      ],
      {
        chk: { exp: 1, cur: "again", stack: errorData0.stack },
        user: {},
      }
    )
  );
};
