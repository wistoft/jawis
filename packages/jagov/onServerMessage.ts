import { assertNever, tos, tryPropString } from "^jab";
import { ConsoleEntry } from "^console";
import { ServerMessage } from "^jagoc";
import { BeeLogEntry } from "^bee-common";
import { StateCallbacks } from "./internal";

type Deps = Pick<StateCallbacks, "setProcessStatus"> & {
  addConsoleData: (event: ConsoleEntry[]) => void;
};

export const makeOnServerMessage = (deps: Deps) => (msg: ServerMessage) => {
  switch (msg.type) {
    case "processStatus":
      deps.setProcessStatus({ processStatus: msg.data });
      break;

    case "stdout":
    case "stderr":
      deps.addConsoleData([
        {
          type: "stream",
          context: msg.script,
          logName: msg.type,
          data: msg.data,
        },
      ]);
      break;

    case "control":
      deps.addConsoleData([
        {
          type: "log",
          context: msg.script,
          logName: "control",
          data: [msg.data],
        },
      ]);
      break;

    case "message":
      //an encapsulated message from the script.
      handleScriptMessage(msg.script, msg.data, deps);
      break;

    default:
      assertNever(msg, "Unknown server message.");
  }
};

//
// util
//

export const handleScriptMessage = (
  script: string,
  umsg: unknown,
  deps: Deps
) => {
  if (!tryPropString(umsg, "type")) {
    deps.addConsoleData([
      {
        type: "log",
        context: script,
        logName: "control",
        data: ["unknown message:", tos(umsg)],
      },
    ]);
    return;
  }

  const msg = umsg as BeeLogEntry;

  switch (msg.type) {
    case "log":
    case "stream":
    case "html":
    case "error":
      deps.addConsoleData([{ context: script, ...msg }]);
      break;

    default: {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const nev: never = msg; // we want exhaustive check, but not to throw.

      deps.addConsoleData([
        {
          type: "log",
          context: script,
          logName: "control",
          data: ["unknown message type", tos(umsg)],
        },
      ]);

      break;
    }
  }
};
