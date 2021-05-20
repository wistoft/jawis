import { assertNever } from "^jab";

import { ClientMessage, ServerMessage } from "^jagoc";

import { BehaviorProv } from "./Behavior";
import { ScriptPoolProv } from "./ScriptPoolController";

import { handleOpenFileInVsCode } from "^util/node";
import { WsMessageListener } from "^jab-express";

export type Deps = ScriptPoolProv & BehaviorProv & { projectRoot: string };

/**
 *
 */
export const makeOnClientMesssage = (
  deps: Deps
): WsMessageListener<ServerMessage, ClientMessage> => (msg) => {
  switch (msg.type) {
    case "startListen":
      deps.onStartListen();
      break;

    case "restartAll":
      deps.restartAllScripts();
      break;

    case "stopAll":
      deps.ensureAllScriptsStopped();
      break;

    case "restartScript":
      //return for testing
      return deps.restartScript(msg.script);

    case "stopScript":
      deps.ensureScriptStopped(msg.script);
      break;

    case "openFile":
      handleOpenFileInVsCode(msg);
      break;

    case "openRelFile":
      handleOpenFileInVsCode(msg, deps.projectRoot);
      break;

    default:
      throw assertNever(msg, "Unknown client message type.");
  }
};
