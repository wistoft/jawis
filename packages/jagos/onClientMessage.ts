import { assertNever } from "^jab";

import { ClientMessage, ServerMessage } from "^jagoc";

import { BehaviorProv } from "./Behavior";
import { ScriptPoolProv } from "./ScriptPoolController";

import { handleOpenFileInVsCode } from "^jawis-util/node";
import { WsMessageListener } from "^jab-express";

export type Deps = ScriptPoolProv & BehaviorProv;

/**
 *
 */
export const makeOnClientMesssage = (
  deps: Deps
): WsMessageListener<ServerMessage, ClientMessage> => (msg, nws) => {
  switch (msg.type) {
    case "startListen":
      deps.onStartListen(nws.ws);
      break;

    case "restartAll":
      deps.restartAllScripts();
      break;

    case "stopAll":
      deps.ensureAllScriptsStopped();
      break;

    case "restartScript":
      deps.restartScript(msg.script);
      break;

    case "stopScript":
      deps.ensureScriptStopped(msg.script);
      break;

    case "openFile":
      handleOpenFileInVsCode(msg);
      break;

    default:
      throw assertNever(msg, "Unknown client message type.");
  }
};
