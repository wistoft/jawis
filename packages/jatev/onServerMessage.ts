import { assertNever } from "^jab";

import { ServerMessage } from "^jatec";

import { StateCallbacks } from "./internal";

type Deps = StateCallbacks;

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
      assertNever(msg, "Unknown server message");
  }
};
