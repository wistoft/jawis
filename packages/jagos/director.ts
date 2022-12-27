import { WsPoolController, WsPoolProv } from "^jab-express";
import { HandleOpenFileInEditor } from "^jab";
import { ClientMessage, ServerMessage } from "^jagoc";

import { Behavior } from "./Behavior";
import {
  ScriptPoolController,
  ScriptPoolControllerDeps,
} from "./ScriptPoolController";
import { ActionProvider } from "./ActionProvider";
import { makeOnClientMesssage } from "./onClientMessage";

export type DirectorDeps = Readonly<{
  handleOpenRelativeFileInEditor: HandleOpenFileInEditor;
  handleOpenFileInEditor: HandleOpenFileInEditor;

  //optional and abstract for testing
  wsPool?: WsPoolProv<ServerMessage, ClientMessage>;
}> &
  Omit<ScriptPoolControllerDeps, keyof ActionProvider | "onStatusChange">;

/**
 *
 */
export const director = (deps: DirectorDeps) => {
  deps.finally(() => behaviorProv.onShutdown()); //trick to register onShutdown, before it has been defined.

  const wsPool =
    deps.wsPool || new WsPoolController<ServerMessage, ClientMessage>(deps);

  const actionProv = new ActionProvider({
    wsPool,
  });

  const poolProv = new ScriptPoolController({
    ...deps,
    ...actionProv,
  });

  const behaviorProv = new Behavior({
    wsPool,
    ...actionProv,
    ...poolProv,
    scriptPool: poolProv,
    onError: deps.onError,
  });

  const onClientMessage = makeOnClientMesssage({
    ...deps,
    ...poolProv,
    ...behaviorProv,
  });

  const onWsUpgrade = wsPool.makeUpgradeHandler(onClientMessage);

  return {
    onWsUpgrade,

    //for testing
    onClientMessage,
  };
};
