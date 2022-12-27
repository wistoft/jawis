import { assertNever, HandleOpenFileInEditor } from "^jab";

import { ClientMessage, ServerMessage } from "^jagoc";

import { WsMessageListener } from "^jab-express";
import { BehaviorProv } from "./Behavior";
import { ScriptPoolProv } from "./ScriptPoolController";

export type Deps = ScriptPoolProv &
  BehaviorProv & {
    handleOpenRelativeFileInEditor: HandleOpenFileInEditor;
    handleOpenFileInEditor: HandleOpenFileInEditor;
  };

/**
 *
 */
export const makeOnClientMesssage =
  (deps: Deps): WsMessageListener<ServerMessage, ClientMessage> =>
  (msg) => {
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
        deps.handleOpenFileInEditor(msg);
        break;

      case "openRelFile":
        deps.handleOpenRelativeFileInEditor(msg);
        break;

      default:
        throw assertNever(msg, "Unknown client message type.");
    }
  };
