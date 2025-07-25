import { WsPoolController } from "^jab-express";
import { FinallyFunc } from "^finally-provider";
import { HandleOpenFileInEditor, LogProv } from "^jab";

import {
  ClientMessage,
  ServerMessage,
  Behavior,
  ClientComController,
  makeOnClientMessage,
} from "./internal";

export type DirectorDeps = Readonly<{
  projectRoot: string;
  handleOpenRelativeFileInEditor: HandleOpenFileInEditor;
  handleOpenFileInEditor: HandleOpenFileInEditor;
  onError: (error: unknown) => void;
  logProv: LogProv;
  finally: FinallyFunc;
}>;

/**
 *
 */
export const director = (deps: DirectorDeps) => {
  deps.finally(() => behavior.onShutdown()); //trick to register onShutdown, before it has been defined.

  const wsPool = new WsPoolController<ServerMessage, ClientMessage>(deps);

  const clientCom = new ClientComController({ wsPool });

  const behavior = new Behavior({
    ...clientCom,
    ...deps,
    wsPool,
  });

  const onClientMessage = makeOnClientMessage({
    ...deps,
    ...clientCom,
    ...behavior,
  });

  const onWsUpgrade = wsPool.makeUpgradeHandler(onClientMessage);

  return {
    onWsUpgrade,
  };
};
