import { WsPoolController } from "^jab-express";
import { FinallyFunc, LogProv } from "^jab";
import { ClientMessage, ServerMessage } from "^jagoc";
import { MakeBee } from "^jab-node";

import { Behavior } from "./Behavior";
import { ScriptPoolController } from "./ScriptPoolController";
import { ActionProvider } from "./ActionProvider";
import { loadScripts, ScriptDefinition } from "./util";
import { makeOnClientMesssage } from "./onClientMessage";

export type Deps = Readonly<{
  scriptFolders?: string[];
  scripts?: ScriptDefinition[];
  alwaysTypeScript?: boolean; //default false.
  makeTsBee: MakeBee;
  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;
}>;

/**
 *
 */
export const director = (deps: Deps) => {
  //read scripts

  const defs = [...loadScripts(deps.scriptFolders), ...(deps.scripts || [])];

  const scripts = defs.map((def) => def.script);

  //setup

  const wsPool = new WsPoolController<ServerMessage, ClientMessage>(deps);

  const actionProv = new ActionProvider({
    scripts,
    wsPool,
  });

  const poolProv = new ScriptPoolController({
    scriptsDefs: defs,
    alwaysTypeScript: deps.alwaysTypeScript,
    makeTsBee: deps.makeTsBee,

    onError: deps.onError,
    finally: deps.finally,
    logProv: deps.logProv,

    ...actionProv,
  });

  const behaviorProv = new Behavior({
    wsPool,
    ...actionProv,
    scriptPool: poolProv,

    onError: deps.onError,
  });

  const onWsUpgrade = wsPool.makeUpgradeHandler(
    makeOnClientMesssage({
      ...deps,
      ...poolProv,
      ...behaviorProv,
    })
  );

  return {
    onWsUpgrade,
    onShutdown: behaviorProv.onShutdown,
  };
};
