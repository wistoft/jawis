import { zipTestLogs } from "^jatec";
import { TestProvision } from "^jarun";
import { errorData1 } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(
    zipTestLogs(
      {
        err: ["What you expect"],
        user: {},
      },
      {
        user: {},
      }
    )
  );

  imp(
    zipTestLogs(
      {
        err: ["What you expect"],
        user: {},
      },
      {
        err: [errorData1],
        user: { imp: ["only cur"] },
      }
    )
  );

  imp(
    zipTestLogs(
      {
        return: 1,
        user: {},
      },
      {
        return: 2,
        user: {},
      }
    )
  );

  imp(
    zipTestLogs(
      {
        user: {},
      },
      {
        chk: {
          exp: 1,
          cur: 2,
          stack: { type: "node", stack: "some stack" },
        },
        user: {},
      }
    )
  );
};
