import { assertNever, clone } from "^jab";
import { ConsoleEntry } from "^console";
import { ClientMessage, ServerMessage } from "^jagoc";
import { StateCallbacks } from "./types";
import { handleBeeFrostMessage } from "./beeHive";

type Deps = Pick<StateCallbacks, "setProcessStatus"> & {
  addConsoleData: (event: ConsoleEntry[]) => void;
  apiSend: (data: ClientMessage) => void; //for beefrost
};

export const makeOnServerMessage = (deps: Deps) => (msg: ServerMessage) => {
  switch (msg.type) {
    case "processStatus":
      deps.setProcessStatus({ processStatus: msg.data });
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
      deps.addConsoleData([
        {
          type: "log",
          context: msg.script,
          logName: "messages",
          data: [clone(msg.data)],
        },
      ]);
      break;

    case "log":
      deps.addConsoleData([{ context: msg.script, ...msg.data }]);
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

    case "beeFrost":
      handleBeeFrostMessage(msg.data, deps);
      break;

    default:
      assertNever(msg, "Unknown server message.");
  }
};
