import { TestProvision } from "^jarun";

import { errorData, errorData0 } from "../_fixture";
import { mergeTestLogsAndRogue } from "^jatec";

// rogue errors

export default ({ log, imp }: TestProvision) => {
  imp(mergeTestLogsAndRogue([], { err: [errorData0], user: {} }));

  //has log already

  imp(
    mergeTestLogsAndRogue(
      [{ type: "err", name: "err", exp: ["expectation"], cur: [] }],
      { err: [errorData0], user: {} }
    )
  );

  //has rogue log already

  log(
    "has rogue already",
    mergeTestLogsAndRogue(
      [
        {
          type: "user",
          name: "rogue.err",
          exp: [],
          cur: [errorData("existing error") as any],
        },
      ],
      { err: [errorData("rogue error")], user: {} }
    )
  );
};
