import { assertNever } from "^jab";
import { ConsoleEntry } from "^console";

import {
  ServerMessage,
  StateCallbacks,
  jsonToUrlQueryString,
} from "./internal";

type Deps = Pick<StateCallbacks, "setProcessStatus"> & {
  addConsoleData: (event: ConsoleEntry[]) => void;
};

/**
 *
 */
export const makeOnServerMessage = (deps: Deps) => (msg: ServerMessage) => {
  switch (msg.type) {
    case "processStatus":
      deps.setProcessStatus({ processStatus: msg.data });
      break;

    case "gotoUrl":
      (window as any).location = msg.url;
      break;

    case "pushUrlState": {
      const qs = jsonToUrlQueryString(msg.urlState);
      (history as any).replaceState(msg, "", "?" + qs);
      break;
    }

    case "replaceUrlState": {
      const qs = jsonToUrlQueryString(msg.urlState);
      (history as any).replaceState(msg, "", "?" + qs);
      break;
    }
    case "log":
    case "stream":
    case "status":
    case "html":
    case "error":
      deps.addConsoleData([{ context: msg.script, ...msg }]);
      break;

    default:
      assertNever(msg, "Unknown server message.");
  }
};
