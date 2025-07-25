import { WsPoolProv } from "^jab-express";

import { ClientMessage, ServerMessage } from "./internal";

export type ClientComProv = {
  onPingAll: () => void;
};

type Deps = {
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
};

/**
 *
 */
export class ClientComController implements ClientComProv {
  constructor(private deps: Deps) {}

  /**
   *
   */
  public onPingAll = () => {};
}
