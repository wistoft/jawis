import { assertNever } from "^jab";

import { StateCallbacks, ServerMessage } from "./internal";

type Deps = Pick<
  StateCallbacks,
  | "setIsRunning"
  | "setTestSelection"
  | "setExecutingTestCase"
  | "setTestReport"
  | "setRogue"
>;

/**
 *
 */
export const makeOnServerMessage = (deps: Deps) => (msg: ServerMessage) => {
  switch (msg.type) {
    case "IsRunning": {
      const { data: isRunning } = msg;

      deps.setIsRunning(isRunning);

      if (!isRunning) {
        //needed, because we don't unset it anywhere else.
        deps.setExecutingTestCase();
      }
      break;
    }

    case "TestSelection":
      deps.setTestSelection(msg.data);
      break;

    case "TestCaseStarts":
      deps.setExecutingTestCase(msg.data);
      break;

    case "TestReport":
      deps.setTestReport(msg.data);
      break;

    case "OnRogue":
      deps.setRogue(msg.data);
      break;

    default:
      assertNever(msg, "Unknown server message.");
  }
};
