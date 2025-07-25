import express from "express";

import { NodeWS, SocketData } from "./internal";

//
// ws
//

export type NodeWSProv<MS extends {}> = {
  send: (data: MS) => void;
  shutdown: () => Promise<void>;
  noisyKill: () => Promise<void>;
};

export type WsMessageListener<MS extends SocketData, MR extends SocketData> = (
  message: MR,
  nws: NodeWS<MS, MR>
) => void;

//
// from @types/express-serve-static-core
//
export interface ParamsDictionary {
  [key: string]: string;
}

//quick fix
export { express };
