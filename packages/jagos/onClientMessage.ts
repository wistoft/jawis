import { HandleOpenFileInEditor, assertNever } from "^jab";
import { WsMessageListener } from "^jab-express";

import {
  ClientMessage,
  ServerMessage,
  BehaviorProv,
  ScriptPoolProv,
} from "./internal";

type Deps = ScriptPoolProv &
  BehaviorProv & {
    handleOpenRelativeFileInEditor: HandleOpenFileInEditor;
    handleOpenFileInEditor: HandleOpenFileInEditor;
  };

/**
 *
 */
export const makeOnClientMessage =
  (deps: Deps): WsMessageListener<ServerMessage, ClientMessage> =>
  (msg) => {
    switch (msg.type) {
      case "startListen":
        return deps.onStartListen();

      case "restartAll":
        return deps.restartAllScripts();

      case "stopAll":
        return deps.stopAllScripts();

      case "restartScript":
        return deps.restartBee(msg.script, msg.data);

      case "stopScript":
        return deps.stopScript(msg.script);

      case "killScript":
        return deps.killScript(msg.script);

      case "openFile":
        return deps.handleOpenFileInEditor(msg);

      case "openRelFile":
        return deps.handleOpenRelativeFileInEditor(msg);

      default:
        assertNever(msg, "Unknown client message type.");
    }
  };
