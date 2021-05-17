import type { Application } from "express";

import { NodeWS, NodeWsDeps, ServerDeps, SocketData } from "^jab-express";
import { TestProvision } from "^jarun";

import { getDefaultServerConf, getServer_chatty } from ".";

/**
 *
 */
export const getServerAndNodeWs = (
  prov: TestProvision,
  logPrefix = "",
  extraNodeWsDeps: Partial<NodeWsDeps>,
  extraServerDeps: Partial<ServerDeps> & {
    app: Application;
  }
) =>
  getServer_chatty(prov, logPrefix, extraServerDeps).then((server) =>
    getNodeWs(prov, logPrefix, extraNodeWsDeps).then((nws) => ({
      nws,
      server,
    }))
  );

/**
 *
 */
export const getNodeWs = <MS, MR>(
  prov: TestProvision,
  logPrefix = "",
  extraDeps?: Partial<NodeWsDeps>
) => {
  const nws = getNodeWs_starting<MS, MR>(prov, logPrefix, extraDeps);

  return nws.waiter.await("running").then(() => nws);
};

/**
 *
 */
export const getNodeWs_starting = <
  MS extends SocketData,
  MR extends SocketData
>(
  prov: TestProvision,
  logPrefix = "",
  extraDeps?: Partial<NodeWsDeps>
) => new NodeWS<MS, MR>(getNodeWsDeps(prov, logPrefix, extraDeps));

/**
 *
 */
export const getNodeWsDeps = <MR extends SocketData>(
  prov: TestProvision,
  logPrefix = "",
  extraDeps?: Partial<NodeWsDeps>
): NodeWsDeps<MR> => ({
  ...getDefaultServerConf(),

  onError: prov.onError,
  finally: prov.finally,

  onOpen: () => {
    prov.log(logPrefix + "nodeWs", "open");
  },

  onMessage: (data: MR) => {
    prov.log(logPrefix + "nodeWs.message", data);
  },

  onClose: () => {
    prov.log(logPrefix + "nodeWs", "close");
  },
  ...extraDeps,
});
