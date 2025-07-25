//
// websocket - client message
//

export type ClientMessage =
  | {
      type: "ping";
    }
  | {
      type: "pingClients";
    }
  | {
      type: "stopServer";
    }
  | {
      type: "poisonReceiveEmptyObject";
    };

//
// websocket - server message
//

export type ServerMessage =
  | {
      type: "pong";
    }
  | {
      type: "ping all";
    };
