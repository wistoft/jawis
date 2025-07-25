import { WsPoolController, WsPoolProv } from "^jab-express";
import { HandleOpenFileInEditor } from "^jab";

import {
  ClientMessage,
  ServerMessage,
  Behavior,
  ScriptPoolController,
  ClientComController,
  makeOnClientMessage,
  ScriptPoolControllerDeps,
} from "./internal";

export type DirectorDeps = Readonly<
  {
    handleOpenRelativeFileInEditor: HandleOpenFileInEditor;
    handleOpenFileInEditor: HandleOpenFileInEditor;

    //for testing
    wsPool?: WsPoolProv<ServerMessage, ClientMessage>;
  } & Omit<
    ScriptPoolControllerDeps,
    keyof ClientComController | "onStatusChange"
  >
>;

/**
 *
 */
export const director = (deps: DirectorDeps) => {
  deps.finally(() => behavior.onShutdown()); //trick to register onShutdown, before it has been defined.

  const wsPool = deps.wsPool || new WsPoolController<ServerMessage, ClientMessage>(deps); // prettier-ignore

  const clientCom = new ClientComController({
    wsPool,
  });

  const scriptPool = new ScriptPoolController({
    ...deps,
    ...clientCom,
    onStatusChange,
  });

  const behavior = new Behavior({
    ...clientCom,
    wsPool,
    scriptPool,
    onError: deps.onError,
  });

  const onClientMessage = makeOnClientMessage({
    ...deps,
    ...scriptPool,
    ...behavior,
  });

  const onWsUpgrade = wsPool.makeUpgradeHandler(onClientMessage);

  //internal messages

  function onStatusChange() {
    //just send all of it.
    clientCom.sendProcessStatus(scriptPool.getScriptStatus());
  }

  return {
    onWsUpgrade,

    //for testing
    onClientMessage,
  };
};
