import WebSocket from "ws";

export type WsServerProv<T> = Readonly<{
  send: (data: T) => void;
  forAll: (cb: (ws: WebSocket) => void) => void;
}>;

type Deps = Readonly<{
  wsServer: WebSocket.Server;
}>;

/**
 * todo: delete this.
 */
export class WsServerService<T> implements WsServerProv<T> {
  constructor(private deps: Deps) {}

  public send = (data: T) => {
    this.forAll((client) => {
      client.send(JSON.stringify(data));
    });
  };

  public forAll = (cb: (client: WebSocket) => void) => {
    this.deps.wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        cb(client);
      }
    });
  };
}
