import { WsPoolController } from "^jab-express";
import { FinallyFunc } from "^finally-provider";
import { LogProv } from "^jab";

import {
  ClientMessage,
  ServerMessage,
  Behavior,
  ClientComController,
  makeOnClientMessage,
} from "./internal";

export type DirectorDeps = Readonly<{
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
    wsPool,
    onError: deps.onError,
  });

  const onClientMessage = makeOnClientMessage({
    ...clientCom,
    ...behavior,
  });

  const onWsUpgrade = wsPool.makeUpgradeHandler(onClientMessage);

  return {
    onWsUpgrade,
  };
};
