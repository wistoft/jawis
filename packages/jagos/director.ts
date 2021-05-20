import { WsPoolController, WsPoolProv } from "^jab-express";
import { FinallyFunc, LogProv } from "^jab";
import { ClientMessage, ServerMessage } from "^jagoc";
import { MakeBee } from "^jab-node";

import { Behavior } from "./Behavior";
import { ScriptPoolController } from "./ScriptPoolController";
import { ActionProvider } from "./ActionProvider";
import { ScriptDefinition } from "./util";
import { makeOnClientMesssage } from "./onClientMessage";

export type Deps = Readonly<{
  projectRoot: string;
  scriptFolders?: string[];
  scripts?: ScriptDefinition[];
  alwaysTypeScript?: boolean; //default false.
  makeTsBee: MakeBee;
  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;

  //optional and abstract for testing
  wsPool?: WsPoolProv<ServerMessage, ClientMessage>;
}>;

/**
 *
 */
export const director = (deps: Deps) => {
  deps.finally(() => behaviorProv.onShutdown()); //trick to register onShutdown, before it has been defined.

  const wsPool =
    deps.wsPool || new WsPoolController<ServerMessage, ClientMessage>(deps);

  const actionProv = new ActionProvider({
    wsPool,
  });

  const poolProv = new ScriptPoolController({
    scriptFolders: deps.scriptFolders,
    scripts: deps.scripts,
    makeTsBee: deps.makeTsBee,
    alwaysTypeScript: deps.alwaysTypeScript,

    onError: deps.onError,
    finally: deps.finally,
    logProv: deps.logProv,

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
