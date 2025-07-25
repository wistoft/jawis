import { assertNever, HandleOpenFileInEditor } from "^jab";
import { WsMessageListener } from "^jab-express";

import {
  ClientMessage,
  ServerMessage,
  ClientComProv,
  BehaviorProv,
} from "./internal";

type Deps = ClientComProv &
  BehaviorProv & {
    handleOpenRelativeFileInEditor: HandleOpenFileInEditor;
    handleOpenFileInEditor: HandleOpenFileInEditor;
  };

/**
 *
 */
export const makeOnClientMessage =
  (deps: Deps): WsMessageListener<ServerMessage, ClientMessage> =>
  (msg, nws) => {
    switch (msg.type) {
      case "call-function":
        deps.callFunction(msg, nws);
        break;

      case "openFile":
        deps.handleOpenFileInEditor(msg);
        break;

      case "openRelFile":
        deps.handleOpenRelativeFileInEditor(msg);
        break;

      default:
        assertNever(msg, "Unknown client message type.");
    }
  };
