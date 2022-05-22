import { assertNever } from "^jab";

import { ClientMessage, ServerMessage } from "^jagoc";

import { BehaviorProv } from "./Behavior";
import { ScriptPoolProv } from "./ScriptPoolController";

import { HandleOpenFileInEditor } from "^util-javi/node";
import { WsMessageListener } from "^jab-express";
import { WsBuzzStore } from "^jabroc";

export type Deps = ScriptPoolProv &
  BehaviorProv & {
    projectRoot: string;
    browserBeeFrost: WsBuzzStore;
    handleOpenFileInEditor: HandleOpenFileInEditor;
  };

/**
 *
 */
export const makeOnClientMesssage =
  (deps: Deps): WsMessageListener<ServerMessage, ClientMessage> =>
  (msg, nws) => {
    switch (msg.type) {
      case "startListen":
        deps.onStartListen();

        deps.browserBeeFrost.register(nws); //let the browser tab function as a bee hive.
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
        deps.handleOpenFileInEditor(msg, deps.projectRoot);
        break;

      case "beeFrost":
        deps.browserBeeFrost.onMessage(nws, msg.data);
        break;

      default:
        throw assertNever(msg, "Unknown client message type.");
    }
  };
