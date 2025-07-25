import { assertNever } from "^jab";

import { FunctionException, FunctionResponse, ServerMessage } from "./internal";

type Deps = {
  onFunctionResponse: (msg: FunctionResponse) => void;
  onFunctionException: (msg: FunctionException) => void;
};

/**
 *
 */
export const makeOnServerMessage = (deps: Deps) => (msg: ServerMessage) => {
  switch (msg.type) {
    case "function-response":
      deps.onFunctionResponse(msg);
      break;

    case "function-exception":
      deps.onFunctionException(msg);
      break;

    case "ping all":
      console.log("ping all");
      break;

    default:
      assertNever(msg, "Unknown server message.");
  }
};
