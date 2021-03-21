//
// http - client messasge
//

export type HttpRequest =
  | {
      type: "getSomeJson";
    }
  | {
      type: "sendErrMessage";
    }
  | {
      type: "sendInvalidResponseStatus";
    }
  | {
      type: "poisonJabError";
    }
  | {
      type: "poisonBlankResponse";
    }
  | {
      type: "invalidErrorObject";
    }
  | {
      type: "stopServer";
    };

//
// websocket - client messasge
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
// websocket - server messasge
//

export type ServerMessage =
  | {
      type: "pong";
    }
  | {
      type: "ping all";
    };
