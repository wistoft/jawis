import { WsStates } from "^react-use-ws";

import { ClientMessage } from "./internal";

export type ApiProv = {
  apiSend: (data: ClientMessage) => void;
  wsState: WsStates;
};

//
// state
//

export type State = {
  clicked: boolean;
};

//
// callbacks/hooks
//

export type StateCallbacks = {
  onClick: () => void;
  useReset: (id: boolean) => () => void;
};
