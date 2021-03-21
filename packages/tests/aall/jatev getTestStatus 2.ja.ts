import { getTestStatus } from "^jatec";
import { TestProvision } from "^jarun";
import { errorData1, errorData2 } from "../_fixture";

//error logs

export default ({ eq }: TestProvision) => {
  eq(
    ".",
    getTestStatus([
      {
        type: "err",
        name: "err",
        exp: [errorData1.msg],
        cur: [errorData1 as any],
      },
    ])
  );

  eq(
    2,
    getTestStatus([
      {
        type: "err",
        name: "err",
        exp: [errorData1.msg],
        cur: [errorData2 as any],
      },
    ])
  );

  eq(
    2,
    getTestStatus([
      { type: "err", name: "err", exp: [], cur: [errorData1 as any] },
    ])
  );
  eq(
    2,
    getTestStatus([
      { type: "err", name: "err", exp: [errorData1.msg], cur: [] },
    ])
  );
};
